import { useState, useMemo, useEffect } from 'react';
import { useFilterStore } from '../stores/useFilterStore';
import { useModalStore } from '../stores/useModalStore';
import { useUserStore } from '../stores/useUserStore';
import CardModal from '../components/shared/CardModal';
import KanbanColumn from '../components/kanban/KanbanColumn';
import SortableCardItem from '../components/kanban/SortableCardItem';
import {
    DndContext, DragOverlay, closestCorners, KeyboardSensor,
    PointerSensor, useSensor, useSensors, defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Card, EquipmentGroup, Team } from '../types';
import { Trash2, Search, Plus, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import {
    subscribeToCards,
    subscribeToMessages,
    subscribeToMonthlyData,
    upsertCard,
    deleteCard,
    addMessage,
    updateMonthlyCardData,
    auditLog
} from '../lib/firestoreService';
import type { Message } from '../lib/firestoreService';

// Mock data initially to help build the UI
// --- Local constants replaced by Firebase ---
const TEAMS: Team[] = ['Pré Assigment', 'Jeppesen', 'CAE'];

export default function Board() {
    const {
        searchQuery, setSearchQuery, statusFilter, teamFilter, equipmentFilter,
        selectedMonth, setEquipmentFilter
    } = useFilterStore();
    const { isOpen, editingCard, openEditCard, openNewCard, closeModal } = useModalStore();
    const { currentUser } = useUserStore();

    const [allCards, setAllCards] = useState<Card[]>([]);
    const [monthlyData, setMonthlyData] = useState<Record<string, Record<string, Partial<Card>>>>({});
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({
        'Pré Assigment': true,
        'Jeppesen': true,
        'CAE': true
    });
    const toggleTeam = (team: string) => setExpandedTeams(prev => ({ ...prev, [team]: !prev[team] }));
    const [showSidebar, setShowSidebar] = useState(true);

    // --- FIREBASE SUBSCRIPTIONS ---
    useEffect(() => {
        const unsub = subscribeToCards(setAllCards);
        return () => unsub();
    }, []);

    useEffect(() => {
        const unsub = subscribeToMonthlyData(setMonthlyData);
        return () => unsub();
    }, []);

    useEffect(() => {
        const unsub = subscribeToMessages(selectedMonth, setMessages);
        return () => unsub();
    }, [selectedMonth]);

    const currentMonthMessages = useMemo(() => {
        return messages.filter(m => m.month === selectedMonth);
    }, [messages, selectedMonth]);

    // Merge global card data with month-specific status/notes
    const currentMonthCards = useMemo(() => {
        return allCards
            .filter(card => !card.startMonth || card.startMonth <= selectedMonth)
            .map(card => {
                const monthOverrides = monthlyData[selectedMonth]?.[card.id] || {};
                return {
                    ...card,
                    // If no override exists for this month, default status is 'Pendente'
                    status: monthOverrides.status || 'Pendente',
                    ...monthOverrides,
                    // If subtasks are overridden, use them; otherwise use base card subtasks as pending template
                    subTasks: monthOverrides.subTasks || card.subTasks?.map(st => ({ ...st, status: 'Pendente' }))
                };
            });
    }, [allCards, monthlyData, selectedMonth]);

    const filteredCards = useMemo(() => {
        return currentMonthCards.filter(card => {
            const matchSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === 'Todos' ||
                (statusFilter === 'Pendentes' && card.status === 'Pendente') ||
                (statusFilter === 'Concluídos' && card.status === 'Concluído');
            const matchTeam = teamFilter === 'Todos' || card.team === teamFilter;
            const matchEquipment = equipmentFilter === 'Todos' || card.equipment === equipmentFilter;
            return matchSearch && matchStatus && matchTeam && matchEquipment;
        });
    }, [currentMonthCards, searchQuery, statusFilter, teamFilter, equipmentFilter]);

    // Dnd-kit Handlers
    const [activeCard, setActiveCard] = useState<Card | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const onDragStart = (event: DragStartEvent) => {
        const id = event.active.id as string;
        const current = currentMonthCards.find(c => c.id === id);
        if (current) setActiveCard(current);
    };

    const onDeleteCard = async (id: string) => {
        const card = allCards.find(c => c.id === id);
        if (window.confirm('Deseja realmente excluir este card de todas as meses?')) {
            await deleteCard(id);
            await auditLog({
                user: currentUser?.name || 'Sistema',
                action: 'Deletou',
                target: card?.title || 'Card desconhecido',
                details: `Removido do sistema permanentemente`,
                timestamp: Date.now()
            });
            closeModal();
        }
    };

    const onDragOver = async (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;
        const activeId = active.id as string;
        const overId = over.id as string;
        if (activeId === overId) return;

        const isActiveCard = active.data.current?.type === 'Card';
        const isOverCard = over.data.current?.type === 'Card';
        const isOverColumn = over.data.current?.type === 'Column';

        if (!isActiveCard) return;

        const activeIndex = allCards.findIndex(c => c.id === activeId);
        const activeC = allCards[activeIndex];
        if (activeIndex === -1) return;

        if (isOverCard) {
            const overIndex = allCards.findIndex(c => c.id === overId);
            const overC = allCards[overIndex];
            if (activeC.team !== overC.team || activeC.equipment !== overC.equipment) {
                await upsertCard({ ...activeC, team: overC.team, equipment: overC.equipment });
                await auditLog({
                    user: currentUser?.name || 'Sistema',
                    action: 'Moveu',
                    target: activeC.title,
                    details: `Movido para ${overC.team} (${overC.equipment})`,
                    timestamp: Date.now()
                });
            }
        }
        if (isOverColumn) {
            const tm = overId.replace('col-team-', ''); // ex: col-team-CAE -> CAE
            if (activeC.team !== tm) {
                await upsertCard({ ...activeC, team: tm as Team });
                await auditLog({
                    user: currentUser?.name || 'Sistema',
                    action: 'Moveu',
                    target: activeC.title,
                    details: `Movido para aba da equipe ${tm}`,
                    timestamp: Date.now()
                });
            }
        }
    };

    const onDragEnd = async (event: DragEndEvent) => {
        setActiveCard(null);
        const { active, over } = event;
        if (!over) return;
        const activeId = active.id as string;
        const overId = over.id as string;
        if (activeId === overId) return;

        const activeIndex = allCards.findIndex(c => c.id === activeId);
        const overIndex = allCards.findIndex(c => c.id === overId);
        const newCards = arrayMove(allCards, activeIndex, overIndex);

        // Push all updated orders to Firestore
        await Promise.all(
            newCards.map((c, i) => upsertCard({ ...c, order: i }))
        );
    };

    const handleToggleStatus = async (cardId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Concluído' ? 'Pendente' : 'Concluído';
        const currentData = monthlyData[selectedMonth]?.[cardId] || {};
        await updateMonthlyCardData(selectedMonth, cardId, {
            ...currentData,
            status: newStatus as 'Pendente' | 'Concluído'
        });
    };

    const handleToggleSubTask = async (cardId: string, subTaskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Concluído' ? 'Pendente' : 'Concluído';
        const cardDefinition = currentMonthCards.find(c => c.id === cardId);
        if (!cardDefinition) return;

        const currentSubTasks = cardDefinition.subTasks || [];
        const updatedSubTasks = currentSubTasks.map(st =>
            st.id === subTaskId ? { ...st, status: newStatus as 'Pendente' | 'Concluído' } : st
        );
        const allCompleted = updatedSubTasks.length > 0 && updatedSubTasks.every(st => st.status === 'Concluído');

        const currentData = monthlyData[selectedMonth]?.[cardId] || {};
        const finalStatus = allCompleted ? 'Concluído' : 'Pendente';

        await updateMonthlyCardData(selectedMonth, cardId, {
            ...currentData,
            status: finalStatus as 'Pendente' | 'Concluído',
            subTasks: updatedSubTasks
        });

        if (allCompleted && currentData.status !== 'Concluído') {
            await auditLog({
                user: currentUser?.name || 'Sistema',
                action: 'Concluiu',
                target: cardDefinition.title,
                details: `Todas as subtarefas concluídas em ${selectedMonth}`,
                timestamp: Date.now()
            });
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        await addMessage({
            text: newMessage,
            userName: currentUser?.name || 'Anônimo',
            month: selectedMonth,
            createdAt: Date.now()
        });
        setNewMessage('');
    };

    const handleDeleteMessage = async (id: string) => {
        if (window.confirm('Deseja realmente remover este recado?')) {
            const { deleteMessage } = await import('../lib/firestoreService');
            await deleteMessage(id);
        }
    };

    // --- Progress Calculations for the Header ---
    const allEqGroups: EquipmentGroup[] = ['A320', 'A330', 'ATR', 'ERJ', 'Cmros'];
    const totalCurrentMonthCards = filteredCards.length;
    const completedCurrentMonthCards = filteredCards.filter(c => c.status === 'Concluído').length;
    const globalPercentRaw = totalCurrentMonthCards === 0 ? 0 : (completedCurrentMonthCards / totalCurrentMonthCards);
    const globalProgress = Math.round(globalPercentRaw * 100);
    const globalDashOffset = 175.9 - (175.9 * globalPercentRaw);

    const eqProgressData = allEqGroups.map(eq => {
        const eqCards = filteredCards.filter(c => c.equipment === eq);
        const eqTotal = eqCards.length;
        const eqCompleted = eqCards.filter(c => c.status === 'Concluído').length;
        const eqPercent = eqTotal === 0 ? 0 : Math.round((eqCompleted / eqTotal) * 100);
        return { eq, percent: eqPercent };
    });

    return (
        <div className="flex flex-col h-[calc(100vh-73px)] bg-[#f8fafc] overflow-hidden text-slate-800 font-sans">

            {/* Header de Controles - Adaptado do Mockup */}
            <header className="bg-white border-b border-slate-100 px-6 py-5 shrink-0 z-10 overflow-x-auto no-scrollbar">
                <div className="w-full min-w-[1200px] flex items-center justify-between">

                    {/* Dashboards Ampliados */}
                    <div className="flex items-center gap-10 xl:gap-16">
                        {/* Circular Progress (Maior) */}
                        <div className="flex items-center gap-4 shrink-0">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <svg width="64" height="64" className="transform -rotate-90">
                                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="#2563eb" strokeWidth="4" strokeDasharray="175.9" strokeDashoffset={globalDashOffset} strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-xs font-black text-blue-600">{globalProgress}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-600">Status Geral</span>
                            </div>
                        </div>

                        {/* Barras Horizontais */}
                        <div className="flex items-center gap-6 xl:gap-8 ml-4">
                            {eqProgressData.map(data => (
                                <div key={data.eq} className="w-20 xl:w-28">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 mb-2">
                                        <span className="tracking-widest">{data.eq}</span>
                                        <span className="text-blue-600">{data.percent}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${data.percent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filtros, Busca e Add */}
                    <div className="flex items-center gap-8 shrink-0">
                        <div className="flex items-center gap-2">
                            {['Todos', ...allEqGroups].map((eq) => {
                                const isSelected = equipmentFilter === eq;
                                return (
                                    <button
                                        key={eq}
                                        onClick={() => setEquipmentFilter(eq as any)}
                                        className={`
                                            px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all
                                            ${isSelected
                                                ? 'bg-blue-600 text-white ring-4 ring-blue-50 shadow-sm outline-none'
                                                : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500'
                                            }
                                        `}
                                    >
                                        {eq}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative w-56">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium placeholder-slate-300 shadow-sm"
                                />
                            </div>
                            <button onClick={() => openNewCard()} className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-md shadow-blue-600/20 active:scale-95 transition-all outline-none shrink-0">
                                <Plus size={18} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. Área Central (Scrollável) */}
            <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                <div className="w-full flex gap-6 relative items-start">

                    {/* Feed Principal de Equipes */}
                    <div className="flex-1 flex flex-col gap-5 pb-32">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={onDragStart}
                            onDragOver={onDragOver}
                            onDragEnd={onDragEnd}
                        >
                            {TEAMS.map((team) => {
                                const teamCards = filteredCards.filter(c => c.team === team).sort((a, b) => a.order - b.order);
                                const totalCards = teamCards.length;
                                const completedCards = teamCards.filter(c => c.status === 'Concluído').length;
                                const isExpanded = expandedTeams[team];
                                const columnId = `col-team-${team}`;

                                return (
                                    <div key={team} className="bg-white border border-slate-200/70 shadow-sm rounded-3xl overflow-hidden transition-all duration-300">
                                        <button
                                            onClick={() => toggleTeam(team)}
                                            className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors focus:outline-none"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="text-slate-400">
                                                    {isExpanded ? <ChevronDown size={20} strokeWidth={2.5} /> : <ChevronRight size={20} strokeWidth={2.5} />}
                                                </div>
                                                <h2 className="text-[13px] font-black uppercase tracking-[0.15em] text-slate-800">{team}</h2>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Concluídos:</span>
                                                <span className="text-emerald-500 text-[13px] font-black">{completedCards}</span>
                                                <span className="text-slate-200 text-sm font-black font-light">/</span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total:</span>
                                                <span className="text-slate-700 text-[13px] font-black">{totalCards}</span>

                                                <div className="ml-3 w-16 h-1 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                                                    <div
                                                        className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                                                        style={{ width: totalCards === 0 ? '0%' : `${(completedCards / totalCards) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </button>

                                        <div className={`transition-all duration-300 ease-in-out px-6 ${isExpanded ? 'max-h-[5000px] opacity-100 pb-6' : 'max-h-0 opacity-0 pb-0 overflow-hidden'}`}>
                                            <KanbanColumn id={columnId} team={team} cards={teamCards}>
                                                <div className="space-y-10 pt-4">
                                                    {equipmentFilter === 'Todos' ? (
                                                        allEqGroups.map(eq => {
                                                            const eqCards = teamCards.filter(c => c.equipment === eq);
                                                            if (eqCards.length === 0) return null;

                                                            return (
                                                                <div key={eq} className="space-y-4">
                                                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 border-l-4 border-blue-500">{eq}</h3>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                                        {eqCards.map(card => (
                                                                            <SortableCardItem
                                                                                key={card.id}
                                                                                card={card}
                                                                                openEditCard={openEditCard}
                                                                                onToggleStatus={handleToggleStatus}
                                                                                onToggleSubTask={handleToggleSubTask}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                            {teamCards.map(card => (
                                                                <SortableCardItem
                                                                    key={card.id}
                                                                    card={card}
                                                                    openEditCard={openEditCard}
                                                                    onToggleStatus={handleToggleStatus}
                                                                    onToggleSubTask={handleToggleSubTask}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}

                                                    {teamCards.length === 0 && (
                                                        <div className="py-12 text-center bg-slate-50/80 rounded-[1.25rem] border border-dashed border-slate-200">
                                                            <span className="text-xs font-medium text-slate-400 italic">Sem atividades registradas com os filtros atuais.</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </KanbanColumn>
                                        </div>
                                    </div>
                                );
                            })}
                            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
                                {activeCard && <KanbanColumn id="overlay" team={activeCard.team} cards={[activeCard]}><SortableCardItem card={activeCard} openEditCard={openEditCard} onToggleStatus={handleToggleStatus} onToggleSubTask={handleToggleSubTask} /></KanbanColumn>}
                            </DragOverlay>
                        </DndContext>
                    </div>

                    {/* Painel Lateral (Mural) */}
                    {showSidebar && (
                        <aside className="w-[320px] lg:w-[350px] shrink-0 bg-white border border-slate-200/70 rounded-[2rem] sticky top-0 shadow-sm flex flex-col overflow-hidden h-fit max-h-[calc(100vh-140px)]">
                            <div className="px-6 py-5 border-b border-slate-100/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <MessageSquare size={16} className="text-blue-500 transform -scale-x-100" strokeWidth={2.5} />
                                    <div>
                                        <h2 className="text-[12px] font-black uppercase tracking-[0.1em] text-slate-800">Mural de Recados</h2>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Informativos Operacionais</p>
                                    </div>
                                </div>
                                <button
                                    className="text-slate-300 hover:text-slate-500 transition-colors"
                                    onClick={() => setShowSidebar(false)}
                                >
                                    <ChevronRight size={18} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                                {currentMonthMessages.length === 0 ? (
                                    <div className="text-center text-slate-300 text-xs py-10 font-medium uppercase tracking-tight">Sem avisos para este mês</div>
                                ) : (
                                    currentMonthMessages.map(m => (
                                        <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-100 outline outline-1 outline-offset-[-1px] outline-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all group relative">
                                            {currentUser?.role === 'admin' && (
                                                <button
                                                    onClick={() => handleDeleteMessage(m.id)}
                                                    className="absolute top-3 right-3 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                            <p className="text-xs text-slate-700 font-medium leading-relaxed mb-4 pr-4">{m.text}</p>
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100/60">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                                                        <span className="text-[9px] text-blue-600 font-bold">{m.userName.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-700 tracking-wide">{m.userName.split(' ')[0]}</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                                <textarea
                                    placeholder="Escreva um recado..."
                                    className="w-full text-xs box-border border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 resize-none placeholder:text-slate-300 bg-white p-3 font-medium outline-none"
                                    rows={3}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95"
                                >
                                    POSTAR RECADO
                                </button>
                            </div>
                        </aside>
                    )}

                    {!showSidebar && (
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="fixed right-6 bottom-6 bg-blue-600 text-white p-3.5 rounded-full shadow-[0_8px_16px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all z-40 group"
                            title="Abrir Mural"
                        >
                            <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                    )}

                </div>
            </div>

            <CardModal
                isOpen={isOpen}
                onClose={closeModal}
                card={editingCard}
                onDelete={onDeleteCard}
                onSave={async (data) => {
                    const cardId = editingCard ? editingCard.id : Math.random().toString(36).substr(2, 9);
                    if (editingCard) {
                        await upsertCard({ ...editingCard, ...data });
                        if (data.notes !== undefined) {
                            const currentData = monthlyData[selectedMonth]?.[cardId] || {};
                            await updateMonthlyCardData(selectedMonth, cardId, {
                                ...currentData,
                                notes: data.notes
                            });
                        }
                        await auditLog({
                            user: currentUser?.name || 'Sistema',
                            action: 'Editou',
                            target: data.title || editingCard.title,
                            details: `Alterações salvas no card`,
                            timestamp: Date.now()
                        });
                    } else {
                        const newCard: Card = {
                            id: cardId,
                            title: data.title || '',
                            equipment: data.equipment || 'A320',
                            team: data.team || 'Pré Assigment',
                            status: 'Pendente',
                            order: allCards.length,
                            isMultiTask: data.isMultiTask || false,
                            subTasks: data.subTasks || [],
                            startMonth: selectedMonth,
                            createdAt: Date.now()
                        };
                        await upsertCard(newCard);
                        await auditLog({
                            user: currentUser?.name || 'Sistema',
                            action: 'Criou',
                            target: data.title || 'Novo Card',
                            details: `Criado em ${newCard.team} (${newCard.equipment})`,
                            timestamp: Date.now()
                        });
                    }
                    closeModal();
                }}
            />
        </div >
    );
}
