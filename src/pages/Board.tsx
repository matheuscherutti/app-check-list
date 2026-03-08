import { useState, useMemo, useEffect } from 'react';
import MonthTabs from '../components/layout/MonthTabs';
import Topbar from '../components/layout/Topbar';
import Dashboards from '../components/layout/Dashboards';
import { getAvailableMonths } from '../utils/dateHelper';
import { useFilterStore } from '../stores/useFilterStore';
import { useModalStore } from '../stores/useModalStore';
import { useUserStore } from '../stores/useUserStore';
import CardModal from '../components/shared/CardModal';
import CardItem from '../components/kanban/CardItem';
import KanbanColumn from '../components/kanban/KanbanColumn';
import SortableCardItem from '../components/kanban/SortableCardItem';
import {
    DndContext, DragOverlay, closestCorners, KeyboardSensor,
    PointerSensor, useSensor, useSensors, defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Card, EquipmentGroup, Team } from '../types';
import { Send, User as UserIcon, Trash2 } from 'lucide-react';

// Mock data initially to help build the UI
const TEAMS: Team[] = ['Pré Assigment', 'Jeppesen', 'CAE'];

const MOCK_CARDS: Card[] = [
    { id: '1', title: 'Revisar manual de voo', equipment: 'A320', team: 'Pré Assigment', status: 'Pendente', order: 1, createdAt: Date.now(), isMultiTask: true, subTasks: [{ id: 's1', title: 'Verificar checklist A', status: 'Pendente' }, { id: 's2', title: 'Verificar checklist B', status: 'Pendente' }] },
    { id: '2', title: 'Atualizar Jeppesen FD-Pro', equipment: 'A320', team: 'Jeppesen', status: 'Pendente', order: 1, createdAt: Date.now() },
    { id: '3', title: 'Simulator briefing', equipment: 'A330', team: 'CAE', status: 'Pendente', order: 1, createdAt: Date.now() },
];

interface Message {
    id: string;
    text: string;
    userName: string;
    month: string; // Format: yyyy-MM
    createdAt: number;
}

export default function Board() {
    const {
        searchQuery, statusFilter, teamFilter, equipmentFilter,
        selectedMonth, setSelectedMonth, setEquipmentFilter
    } = useFilterStore();
    const { isOpen, editingCard, openEditCard, closeModal } = useModalStore();
    const { currentUser } = useUserStore();

    const [allCards, setAllCards] = useState<Card[]>(() => {
        const saved = localStorage.getItem('checklist-app-all-cards');
        if (saved) return JSON.parse(saved);

        const months = getAvailableMonths();
        const currentMonth = months[1]; // yyyy-MM
        return MOCK_CARDS.map(c => ({ ...c, startMonth: currentMonth }));
    });

    const [monthlyData, setMonthlyData] = useState<Record<string, Record<string, Partial<Card>>>>(() => {
        const saved = localStorage.getItem('checklist-app-monthly-data');
        return saved ? JSON.parse(saved) : {};
    });

    const [messages, setMessages] = useState<Message[]>(() => {
        const saved = localStorage.getItem('checklist-app-messages');
        if (saved) return JSON.parse(saved);

        const months = getAvailableMonths();
        return [
            {
                id: 'm1',
                text: 'Lembrar de conferir os manuais novos da CAE.',
                userName: 'João Silva',
                month: months[1],
                createdAt: Date.now() - 3600000
            }
        ];
    });

    // Persistence
    useEffect(() => {
        localStorage.setItem('checklist-app-all-cards', JSON.stringify(allCards));
    }, [allCards]);

    useEffect(() => {
        localStorage.setItem('checklist-app-monthly-data', JSON.stringify(monthlyData));
    }, [monthlyData]);

    useEffect(() => {
        localStorage.setItem('checklist-app-messages', JSON.stringify(messages));
    }, [messages]);

    useState(() => {
        // Remove the separate useState initialization for messages since it's now in the initial state
    });

    const [newMessage, setNewMessage] = useState('');

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

    const onDeleteCard = (id: string) => {
        if (window.confirm('Deseja realmente excluir este card de todas as meses?')) {
            setAllCards(prev => prev.filter(c => c.id !== id));
            closeModal();
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;
        const activeId = active.id as string;
        const overId = over.id as string;
        if (activeId === overId) return;

        const isActiveCard = active.data.current?.type === 'Card';
        const isOverCard = over.data.current?.type === 'Card';
        const isOverColumn = over.data.current?.type === 'Column';

        if (!isActiveCard) return;

        setAllCards((prev) => {
            const activeIndex = prev.findIndex(c => c.id === activeId);
            const activeC = prev[activeIndex];
            if (activeIndex === -1) return prev;

            if (isOverCard) {
                const overIndex = prev.findIndex(c => c.id === overId);
                const overC = prev[overIndex];
                if (activeC.team !== overC.team || activeC.equipment !== overC.equipment) {
                    const newCards = [...prev];
                    newCards[activeIndex] = { ...activeC, team: overC.team, equipment: overC.equipment };
                    return arrayMove(newCards, activeIndex, overIndex);
                }
            }
            if (isOverColumn) {
                const [, equip, tm] = overId.split('-'); // format col-A320-Team
                if (activeC.team !== tm || activeC.equipment !== equip) {
                    const newCards = [...prev];
                    newCards[activeIndex] = { ...activeC, team: tm as Team, equipment: equip as EquipmentGroup };
                    return arrayMove(newCards, activeIndex, prev.length - 1);
                }
            }
            return prev;
        });
    };

    const onDragEnd = (event: DragEndEvent) => {
        setActiveCard(null);
        const { active, over } = event;
        if (!over) return;
        const activeId = active.id as string;
        const overId = over.id as string;
        if (activeId === overId) return;

        setAllCards(prev => {
            const activeIndex = prev.findIndex(c => c.id === activeId);
            const overIndex = prev.findIndex(c => c.id === overId);
            const newCards = arrayMove(prev, activeIndex, overIndex);
            return newCards.map((c, i) => ({ ...c, order: i }));
        });
    };

    const handleToggleStatus = (cardId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Concluído' ? 'Pendente' : 'Concluído';
        setMonthlyData(prev => ({
            ...prev,
            [selectedMonth]: {
                ...(prev[selectedMonth] || {}),
                [cardId]: {
                    ...(prev[selectedMonth]?.[cardId] || {}),
                    status: newStatus as 'Pendente' | 'Concluído'
                }
            }
        }));
    };

    const handleToggleSubTask = (cardId: string, subTaskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Concluído' ? 'Pendente' : 'Concluído';
        const cardDefinition = currentMonthCards.find(c => c.id === cardId);
        if (!cardDefinition) return;

        const currentSubTasks = cardDefinition.subTasks || [];
        const updatedSubTasks = currentSubTasks.map(st =>
            st.id === subTaskId ? { ...st, status: newStatus as 'Pendente' | 'Concluído' } : st
        );
        const allCompleted = updatedSubTasks.length > 0 && updatedSubTasks.every(st => st.status === 'Concluído');

        setMonthlyData(prev => ({
            ...prev,
            [selectedMonth]: {
                ...(prev[selectedMonth] || {}),
                [cardId]: {
                    ...(prev[selectedMonth]?.[cardId] || {}),
                    status: (allCompleted ? 'Concluído' : 'Pendente') as 'Pendente' | 'Concluído',
                    subTasks: updatedSubTasks
                }
            }
        }));
    };

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        const msg: Message = {
            id: Date.now().toString(),
            text: newMessage,
            userName: currentUser?.name || 'Anônimo',
            month: selectedMonth,
            createdAt: Date.now()
        };
        setMessages(prev => [msg, ...prev]);
        setNewMessage('');
    };

    const handleDeleteMessage = (id: string) => {
        if (window.confirm('Deseja realmente remover este recado?')) {
            setMessages(prev => prev.filter(m => m.id !== id));
        }
    };

    return (
        <div className="flex h-screen bg-frost-blue overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-3">
                    <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-6">
                        <MonthTabs selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />
                        <Topbar />
                    </div>
                </header>

                <Dashboards cards={filteredCards} />

                {/* Equipment Filter Section */}
                <div className="bg-white border-b border-slate-200 py-3">
                    <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-center gap-2">
                        {(['Todos', 'A320', 'A330', 'ATR', 'ERJ', 'Cmros'] as const).map((eq) => (
                            <button
                                key={eq}
                                onClick={() => setEquipmentFilter(eq)}
                                className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all border ${equipmentFilter === eq
                                    ? 'bg-primary-600 text-white border-primary-600 shadow-md ring-4 ring-primary-100'
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-primary-300 hover:text-primary-600'
                                    }`}
                            >
                                {eq}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto p-8 lg:p-14 space-y-20 pb-32">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={onDragStart}
                            onDragOver={onDragOver}
                            onDragEnd={onDragEnd}
                        >
                            {TEAMS.map((team, index) => {
                                const teamCards = filteredCards.filter(c => c.team === team).sort((a, b) => a.order - b.order);
                                const columnId = `col-team-${team}`;
                                const equipments: EquipmentGroup[] = ['A320', 'A330', 'ATR', 'ERJ', 'Cmros'];

                                return (
                                    <div
                                        key={team}
                                        className={`p-10 lg:p-14 rounded-[3.5rem] shadow-sm border border-slate-100/50 space-y-12 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center gap-4">
                                            <h2 className="text-2xl font-black text-deep-navy uppercase tracking-[0.3em]">{team}</h2>
                                            <div className="h-1.5 w-24 bg-primary-600 rounded-full shadow-sm shadow-primary-600/20"></div>
                                        </div>

                                        <KanbanColumn id={columnId} team={team} cards={teamCards}>
                                            <div className="space-y-10">
                                                {equipmentFilter === 'Todos' ? (
                                                    equipments.map(eq => {
                                                        const eqCards = teamCards.filter(c => c.equipment === eq);
                                                        if (eqCards.length === 0) return null;

                                                        return (
                                                            <div key={eq} className="space-y-4">
                                                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 border-l-4 border-primary-500">{eq}</h3>
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
                                                    <div className="py-12 text-center bg-white/40 border border-dashed border-slate-200 rounded-2xl">
                                                        <span className="text-sm font-bold text-slate-300 uppercase tracking-widest italic">Sem atividades registradas</span>
                                                    </div>
                                                )}
                                            </div>
                                        </KanbanColumn>
                                    </div>
                                );
                            })}
                            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
                                {activeCard && <CardItem card={activeCard} openEditCard={() => { }} onToggleStatus={() => { }} onToggleSubTask={() => { }} />}
                            </DragOverlay>
                        </DndContext>
                    </div>
                </div>
            </div>

            {/* Mural de Recados (Right Sidebar) */}
            <aside className="hidden lg:block w-80 flex-shrink-0 bg-white border-l border-slate-200">
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                        <div className="flex items-center gap-3 mb-1">
                            <Send size={18} className="text-primary-600 rotate-[-15deg]" />
                            <h2 className="text-lg font-black uppercase tracking-tight text-deep-navy">Mural de Recados</h2>
                        </div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Informativos Operacionais</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                        {currentMonthMessages.length === 0 ? (
                            <div className="text-center text-slate-300 text-xs py-10 font-medium uppercase tracking-tight">Sem avisos para este mês</div>
                        ) : (
                            currentMonthMessages.map(m => (
                                <div key={m.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
                                    {currentUser?.role === 'admin' && (
                                        <button
                                            onClick={() => handleDeleteMessage(m.id)}
                                            className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                    <p className="text-deep-navy text-sm font-medium leading-relaxed mb-4 pr-6 italic">{m.text}</p>
                                    <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-primary-600/10 rounded-full flex items-center justify-center">
                                                <UserIcon size={12} className="text-primary-600" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-700">{m.userName}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                        <textarea
                            placeholder="Escreva um recado..."
                            className="w-full text-sm border-slate-200 rounded-xl focus:ring-primary-600 focus:border-primary-600 resize-none placeholder:text-slate-300 bg-white p-3 font-medium"
                            rows={3}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button
                            onClick={handleSendMessage}
                            className="w-full mt-3 bg-deep-navy hover:bg-black text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md active:scale-95"
                        >
                            POSTAR RECADO
                        </button>
                    </div>
                </div>
            </aside>

            <CardModal
                isOpen={isOpen}
                onClose={closeModal}
                card={editingCard}
                onDelete={onDeleteCard}
                onSave={(data) => {
                    const cardId = editingCard ? editingCard.id : Math.random().toString(36).substr(2, 9);
                    if (editingCard) {
                        setAllCards(prev => prev.map(c => c.id === cardId ? { ...c, ...data } : c));
                        setMonthlyData(prev => ({
                            ...prev,
                            [selectedMonth]: {
                                ...(prev[selectedMonth] || {}),
                                [cardId]: { ...prev[selectedMonth]?.[cardId], notes: data.notes }
                            }
                        }));
                    } else {
                        const newCard: Card = {
                            id: cardId,
                            title: data.title || '',
                            equipment: data.equipment || 'A320',
                            team: data.team || 'Pré Assigment',
                            status: 'Pendente',
                            order: allCards.length + 1,
                            isMultiTask: data.isMultiTask,
                            subTasks: data.subTasks,
                            startMonth: selectedMonth,
                            createdAt: Date.now()
                        };
                        setAllCards(prev => [...prev, newCard]);
                    }
                    closeModal();
                }}
            />
        </div >
    );
}
