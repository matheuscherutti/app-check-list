import { useState, useMemo, useEffect } from 'react';
import { useFilterStore } from '../stores/useFilterStore';
import { useModalStore } from '../stores/useModalStore';
import { useUserStore } from '../stores/useUserStore';
import CardModal from '../components/shared/CardModal';
import KanbanColumn from '../components/kanban/KanbanColumn';
import SortableCardItem from '../components/kanban/SortableCardItem';
import {
    DndContext, closestCorners, KeyboardSensor,
    PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import type { DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Card, EquipmentGroup, Team } from '../types';
import { Search, Plus, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import {
    subscribeToCards,
    subscribeToMessages,
    subscribeToMonthlyData,
    upsertCard,
    addMessage,
    updateMonthlyCardData,
    auditLog,
    deleteCard
} from '../lib/firestoreService';
import type { Message } from '../lib/firestoreService';

// --- Local constants replaced by Firebase ---
const TEAMS: Team[] = ['Pré Assigment', 'Jeppesen', 'CAE'];

// Configuração de cores por equipe (Tons de Azul Modernos/Energéticos)
const TEAM_CONFIG: Record<Team, {
    headerBg: string;
    progressColor: string;
    lightBg: string;
    accentText: string;
}> = {
    'Pré Assigment': {
        headerBg: 'bg-indigo-600',
        progressColor: 'bg-indigo-600',
        lightBg: 'bg-slate-50/80',
        accentText: 'text-indigo-600'
    },
    'Jeppesen': {
        headerBg: 'bg-blue-600',
        progressColor: 'bg-blue-600',
        lightBg: 'bg-slate-50/80',
        accentText: 'text-blue-600'
    },
    'CAE': {
        headerBg: 'bg-cyan-600',
        progressColor: 'bg-cyan-600',
        lightBg: 'bg-slate-50/80',
        accentText: 'text-cyan-600'
    }
};

export default function Board() {
    const {
        searchQuery, setSearchQuery, statusFilter, teamFilter, equipmentFilter,
        selectedMonth
    } = useFilterStore();

    const { isOpen, editingCard, openEditCard, openNewCard, closeModal } = useModalStore();
    const { currentUser } = useUserStore();

    const [cards, setCards] = useState<Card[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [monthlyData, setMonthlyData] = useState<Record<string, any>>({});
    const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({
        'Pré Assigment': true,
        'Jeppesen': true,
        'CAE': true
    });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // --- Subscriptions ---
    useEffect(() => {
        const unsubCards = subscribeToCards((data) => setCards(data));
        const unsubMsg = subscribeToMessages(selectedMonth, (data) => setMessages(data));
        const unsubMonthly = subscribeToMonthlyData((data) => setMonthlyData(data));

        return () => {
            unsubCards();
            unsubMsg();
            unsubMonthly();
        };
    }, [selectedMonth]);

    // Merge global card data with monthly overrides
    const mergedCards = useMemo(() => {
        const monthData = monthlyData[selectedMonth] || {};
        return cards.map(card => {
            const override = monthData[card.id] || {};
            return {
                ...card,
                status: override.status || card.status,
                notes: override.notes || card.notes,
                subTasks: card.subTasks?.map(st => ({
                    ...st,
                    status: (override.subTasksStatuses && override.subTasksStatuses[st.id]) || st.status
                }))
            };
        });
    }, [cards, monthlyData, selectedMonth]);

    // Filtering logic
    const filteredCards = useMemo(() => {
        return mergedCards.filter(card => {
            const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'Todos' || (
                statusFilter === 'Pendentes' ? card.status !== 'Concluído' : card.status === 'Concluído'
            );
            const matchesTeam = teamFilter === 'Todos' || card.team === teamFilter;
            const matchesEquip = equipmentFilter === 'Todos' || card.equipment === equipmentFilter;

            return matchesSearch && matchesStatus && matchesTeam && matchesEquip;
        });
    }, [mergedCards, searchQuery, statusFilter, teamFilter, equipmentFilter]);

    // --- Actions ---
    const handleToggleStatus = async (cardId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Concluído' ? 'Pendente' : 'Concluído';
        await updateMonthlyCardData(selectedMonth, cardId, { status: newStatus });

        await auditLog({
            user: currentUser?.name || 'Desconhecido',
            action: 'Concluiu',
            target: cardId,
            details: `Status alterado para ${newStatus} no mês ${selectedMonth}`,
            timestamp: Date.now()
        });
    };

    const handleToggleSubTask = async (cardId: string, subTaskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Concluído' ? 'Pendente' : 'Concluído';
        const card = cards.find(c => c.id === cardId);
        if (!card) return;

        const currentMonthly = (monthlyData[selectedMonth] && monthlyData[selectedMonth][cardId]) || {};
        const subTasksStatuses = { ...(currentMonthly.subTasksStatuses || {}) };
        subTasksStatuses[subTaskId] = newStatus;

        await updateMonthlyCardData(selectedMonth, cardId, { subTasksStatuses });
    };

    const handleSaveCard = async (data: Partial<Card>) => {
        if (editingCard) {
            await upsertCard({ ...editingCard, ...data } as Card);
        } else {
            const newCard: Card = {
                id: Math.random().toString(36).substr(2, 9),
                title: data.title || '',
                equipment: data.equipment as EquipmentGroup,
                team: data.team as Team,
                status: 'Pendente',
                isMultiTask: data.isMultiTask || false,
                subTasks: data.subTasks || [],
                notes: data.notes || ''
            };
            await upsertCard(newCard);
        }
        closeModal();
    };

    const handleDeleteCard = async (id: string) => {
        await deleteCard(id);
        closeModal();
    };

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || !currentUser) return;
        await addMessage({
            text,
            userName: currentUser.name,
            month: selectedMonth,
            createdAt: Date.now()
        });
    };

    // --- Drag & Drop ---
    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId !== overId) {
            // Drag logic for cross-column move could go here
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeCard = cards.find(c => c.id === active.id);
        const overId = over.id as string;

        // If dropped on a column, update team
        if (TEAMS.includes(overId as Team)) {
            if (activeCard && activeCard.team !== overId) {
                await upsertCard({ ...activeCard, team: overId as Team });
                await auditLog({
                    user: currentUser?.name || 'Desconhecido',
                    action: 'Moveu',
                    target: activeCard.id,
                    details: `Movido para equipe ${overId}`,
                    timestamp: Date.now()
                });
            }
        }
    };

    const toggleTeam = (team: string) => {
        setExpandedTeams(prev => ({ ...prev, [team]: !prev[team] }));
    };

    return (
        <div className="flex flex-col h-[calc(100vh-72px)] overflow-hidden bg-slate-50 pt-6">
            <div className="flex flex-1 overflow-x-auto gap-8 px-8 pb-10 scrollbar-hide">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    {TEAMS.map(team => {
                        const teamCards = filteredCards.filter(c => c.team === team);
                        const total = teamCards.length;
                        const completed = teamCards.filter(c => c.status === 'Concluído').length;
                        const progress = total > 0 ? (completed / total) * 100 : 0;
                        const isExpanded = expandedTeams[team];
                        const config = TEAM_CONFIG[team];

                        return (
                            <div key={team} className={`flex flex-col h-fit transition-all duration-500 ease-in-out ${isExpanded ? 'min-w-[360px] flex-1' : 'min-w-[80px] w-[80px]'}`}>
                                {/* Header da Categoria */}
                                <button
                                    onClick={() => toggleTeam(team)}
                                    className={`
                                        relative overflow-hidden flex items-center h-14 mb-4 rounded-2xl transition-all duration-300 group
                                        ${isExpanded ? `${config.headerBg} shadow-lg shadow-blue-500/10` : `bg-white border border-slate-200 hover:border-slate-300`}
                                    `}
                                >
                                    {isExpanded ? (
                                        <div className="flex items-center justify-between w-full px-5 text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-white/20 rounded-lg">
                                                    <ChevronDown size={18} strokeWidth={3} />
                                                </div>
                                                <span className="font-black text-sm uppercase tracking-widest">{team}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black opacity-80 uppercase">{completed}/{total}</span>
                                                <div className="w-12 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center w-full gap-2">
                                            <ChevronRight size={20} className="text-slate-400" />
                                            <div className={`w-2 h-2 rounded-full ${config.progressColor}`} />
                                        </div>
                                    )}
                                </button>

                                {/* Área de Atividades (Cinza Claro) */}
                                <div className={`
                                    ${isExpanded ? `${config.lightBg} border border-slate-100 p-4 rounded-[2rem] min-h-[500px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]` : 'opacity-0 h-0 pointer-events-none'}
                                    transition-all duration-300
                                `}>
                                    <div className="flex flex-col gap-6">
                                        {/* Agrupamento por Equipamento */}
                                        {Array.from(new Set(teamCards.map(c => c.equipment))).sort().map(equip => (
                                            <div key={equip} className="space-y-3">
                                                <div className="flex items-center justify-between px-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1 h-4 rounded-full ${config.progressColor}`} />
                                                        <h3 className={`text-[11px] font-black uppercase tracking-widest ${config.accentText}`}>
                                                            {equip}
                                                        </h3>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-300">
                                                        {teamCards.filter(c => c.equipment === equip).length} ITENS
                                                    </span>
                                                </div>

                                                <KanbanColumn id={`${team}-${equip}`} team={team} cards={teamCards.filter(c => c.equipment === equip)}>
                                                    <div className="flex flex-col gap-3">
                                                        {teamCards.filter(c => c.equipment === equip).map(card => (
                                                            <SortableCardItem
                                                                key={card.id}
                                                                card={card}
                                                                openEditCard={openEditCard}
                                                                onToggleStatus={handleToggleStatus}
                                                                onToggleSubTask={handleToggleSubTask}
                                                            />
                                                        ))}
                                                    </div>
                                                </KanbanColumn>
                                            </div>
                                        ))}

                                        <button
                                            onClick={openNewCard}
                                            className="mt-2 w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-1 group"
                                        >
                                            <Plus size={20} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Novo Item</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </DndContext>

                {/* Mural de Recados */}
                <div className="min-w-[320px] bg-white border border-slate-200 rounded-[2.5rem] shadow-xl flex flex-col overflow-hidden mb-4">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 text-white">
                                <MessageSquare size={18} />
                            </div>
                            <span className="font-black text-sm uppercase tracking-widest text-slate-800">Mural Mensal</span>
                        </div>
                        <div className="px-3 py-1 bg-white border border-slate-200 rounded-full">
                            <span className="text-[9px] font-black text-blue-600 uppercase">{selectedMonth}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-hide">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 italic py-20 text-center">
                                <MessageSquare size={40} strokeWidth={1} className="mb-2 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest opacity-40">Sem avisos este mês</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{msg.text}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">{msg.userName}</span>
                                        <span className="text-[9px] font-bold text-slate-300">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Postar no mural..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSendMessage((e.target as HTMLInputElement).value);
                                        (e.target as HTMLInputElement).value = '';
                                    }
                                }}
                                className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-4 pr-12 text-sm font-bold placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">
                                Enter
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra de Busca Flutuante */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 h-14 bg-slate-900 shadow-2xl shadow-black/20 px-4 rounded-2xl flex items-center gap-4 border border-white/10 z-[100] backdrop-blur-md">
                <div className="flex items-center gap-3 h-full pr-4 border-r border-white/10">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar atividade..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-white text-sm font-bold placeholder:text-slate-500 border-none focus:ring-0 min-w-[200px]"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-400">⌘</div>
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-400">F</div>
                </div>
            </div>

            <CardModal
                isOpen={isOpen}
                onClose={closeModal}
                card={editingCard}
                onSave={handleSaveCard}
                onDelete={handleDeleteCard}
            />
        </div>
    );
}
