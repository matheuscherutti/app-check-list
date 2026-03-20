import { useState, useMemo, useEffect } from 'react';
import { useFilterStore } from '../stores/useFilterStore';
import { useModalStore } from '../stores/useModalStore';
import { useUserStore } from '../stores/useUserStore';
import CardModal from '../components/shared/CardModal';
import KanbanColumn from '../components/kanban/KanbanColumn';
import SortableCardItem from '../components/kanban/SortableCardItem';
import Dashboards from '../components/layout/Dashboards';
import {
    DndContext, closestCorners
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import type { Card, EquipmentGroup, Team, Status } from '../types';
import { Search, Plus, MessageSquare, ChevronDown, ChevronRight, Trash2, Filter } from 'lucide-react';
import {
    subscribeToCards,
    subscribeToMessages,
    subscribeToMonthlyData,
    updateMonthlyCardData,
    auditLog,
    upsertCard as upsertCardBase,
    addMessage,
    deleteMessage
} from '../lib/firestoreService';
import type { Message } from '../lib/firestoreService';

// --- Local constants ---
const TEAMS: Team[] = ['Pré Assigment', 'Jeppesen', 'CAE'];
const EQUIPMENTS: EquipmentGroup[] = ['A320', 'A330', 'ATR', 'ERJ', 'Cmros'];

// Configuração de cores por equipe
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
        searchQuery, setSearchQuery, statusFilter, teamFilter, equipmentFilter, setEquipmentFilter,
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

    // Merge global card data with monthly overrides and versioning
    const mergedCards = useMemo(() => {
        // Encontrar meses com overrides
        const allMonths = Object.keys(monthlyData).sort();

        return cards
            .filter(c => {
                // Filtro Temporal: Ativo desde o mês X e até o mês Y
                const isAfterStart = c.activeFrom <= selectedMonth;
                const isBeforeEnd = !c.activeUntil || c.activeUntil > selectedMonth;
                return isAfterStart && isBeforeEnd;
            })
            .map(card => {
                // 1. Buscar Overrides (Título, Equipe, Time) - O mais recente <= selectedMonth vence
                let title = card.title;
                let team = card.team;
                let equipment = card.equipment;

                const previousMonthsWithOverrides = allMonths.filter(m => m <= selectedMonth).reverse();
                for (const m of previousMonthsWithOverrides) {
                    const override = monthlyData[m]?.[card.id]?.overrides;
                    if (override) {
                        if (override.title) title = override.title;
                        if (override.team) team = override.team;
                        if (override.equipment) equipment = override.equipment;
                        break; // Achamos a "versão" mais recente para este mês
                    }
                }

                // 2. Buscar Status e Notas (Específicos deste mês)
                const monthInfo = (monthlyData[selectedMonth] && monthlyData[selectedMonth][card.id]) || {};

                // Mapear sub-tarefas com seus status específicos deste mês
                const subTasks = card.subTasks?.map(st => ({
                    ...st,
                    status: (monthInfo.subTasksStatuses && monthInfo.subTasksStatuses[st.id]) || st.status
                })) || [];

                // Lógica Visual: Card multi-tarefa é considerado Concluído apenas se TODAS sub-tarefas estão OK
                const isActuallyCompleted = card.isMultiTask
                    ? (subTasks.length > 0 && subTasks.every(st => st.status === 'Concluído'))
                    : (monthInfo.status || card.status) === 'Concluído';

                return {
                    ...card,
                    title,
                    team,
                    equipment: equipment as EquipmentGroup,
                    status: (isActuallyCompleted ? 'Concluído' : 'Pendente') as Status,
                    notes: monthInfo.notes || card.notes,
                    subTasks: subTasks.map(st => ({
                        ...st,
                        status: (st.status || 'Pendente') as Status
                    }))
                } as Card;
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
        const card = cards.find(c => c.id === cardId);
        if (!card) return;

        await updateMonthlyCardData(selectedMonth, cardId, { status: newStatus });

        await auditLog({
            user: currentUser?.name || 'Desconhecido',
            action: 'Concluiu',
            target: card.title,
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

    const upsertCard = async (card: Card) => {
        const safeCard = {
            ...card,
            activeFrom: card.activeFrom || selectedMonth
        };
        await upsertCardBase(safeCard);
    };

    const handleSaveCard = async (data: Partial<Card>) => {
        if (editingCard) {
            const hasChanges = (data.title && data.title !== editingCard.title) ||
                (data.team && data.team !== editingCard.team) ||
                (data.equipment && data.equipment !== editingCard.equipment);

            if (hasChanges) {
                await updateMonthlyCardData(selectedMonth, editingCard.id, {
                    overrides: {
                        title: data.title,
                        team: data.team,
                        equipment: data.equipment
                    }
                });

                await auditLog({
                    user: currentUser?.name || 'Desconhecido',
                    action: 'Editou',
                    target: data.title || editingCard.title,
                    details: `Alterou propriedades globais no mês ${selectedMonth}. Mudança afeta este mês e futuros.`,
                    timestamp: Date.now()
                });
            } else {
                await updateMonthlyCardData(selectedMonth, editingCard.id, {
                    notes: data.notes
                });
            }
        } else {
            const cardId = Math.random().toString(36).substr(2, 9);
            const newCard: Card = {
                id: cardId,
                title: data.title || '',
                equipment: (data.equipment || 'A320') as EquipmentGroup,
                team: (data.team || 'Pré Assigment') as Team,
                status: 'Pendente',
                order: cards.length,
                isMultiTask: data.isMultiTask || false,
                subTasks: data.subTasks || [],
                notes: data.notes || '',
                activeFrom: selectedMonth,
                createdAt: Date.now()
            };
            await upsertCard(newCard);

            await auditLog({
                user: currentUser?.name || 'Desconhecido',
                action: 'Criou',
                target: newCard.title,
                details: `Atividade criada no controle de ${selectedMonth}`,
                timestamp: Date.now()
            });
        }
        closeModal();
    };

    const handleDeleteCard = async (id: string) => {
        const card = cards.find(c => c.id === id);
        if (!card) return;

        if (window.confirm(`Tem certeza que deseja remover "${card.title}" a partir de ${selectedMonth}? (O histórico de meses anteriores será preservado)`)) {
            await upsertCard({ ...card, activeUntil: selectedMonth });

            await auditLog({
                user: currentUser?.name || 'Desconhecido',
                action: 'Deletou',
                target: card.title,
                details: `Atividade removida do controle a partir de ${selectedMonth}`,
                timestamp: Date.now()
            });
            closeModal();
        }
    };

    const handleDeleteMessage = async (id: string) => {
        if (window.confirm('Excluir este aviso para todos?')) {
            await deleteMessage(id);
        }
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

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeCard = cards.find(c => c.id === active.id);
        const overId = over.id as string;

        if (TEAMS.includes(overId as Team)) {
            if (activeCard && activeCard.team !== overId) {
                await upsertCard({ ...activeCard, team: overId as Team });
                await auditLog({
                    user: currentUser?.name || 'Desconhecido',
                    action: 'Moveu',
                    target: activeCard.title,
                    details: `Movido para equipe ${overId} no mês ${selectedMonth}`,
                    timestamp: Date.now()
                });
            }
        }
    };

    const toggleTeam = (team: string) => {
        setExpandedTeams(prev => ({ ...prev, [team]: !prev[team] }));
    };

    const isAdmin = currentUser?.role === 'admin';

    return (
        <div className="flex flex-col h-[calc(100vh-72px)] overflow-hidden bg-slate-50">
            {/* Gráficos Reintroduzidos */}
            <Dashboards cards={mergedCards} />

            <div className="flex flex-1 overflow-x-auto gap-8 px-8 pb-10 scrollbar-hide">
                <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                    {TEAMS.map(team => {
                        const teamCards = filteredCards.filter(c => c.team === team);
                        const total = teamCards.length;
                        const completed = teamCards.filter(c => c.status === 'Concluído').length;
                        const progress = total > 0 ? (completed / total) * 100 : 0;
                        const isExpanded = expandedTeams[team];
                        const config = TEAM_CONFIG[team];

                        return (
                            <div key={team} className={`flex flex-col h-fit transition-all duration-500 ease-in-out ${isExpanded ? 'min-w-[380px] flex-1' : 'min-w-[80px] w-[80px]'}`}>
                                <button
                                    onClick={() => toggleTeam(team)}
                                    className={`relative overflow-hidden flex items-center h-14 mb-4 rounded-2xl transition-all duration-300 ${isExpanded ? `${config.headerBg} shadow-lg shadow-blue-500/10` : `bg-white border border-slate-200`}`}
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

                                <div className={`${isExpanded ? `${config.lightBg} border border-slate-100 p-4 rounded-[2rem] min-h-[500px] shadow-sm` : 'opacity-0 h-0 pointer-events-none'}`}>
                                    <div className="flex flex-col gap-6">
                                        {Array.from(new Set(teamCards.map(c => c.equipment))).sort().map(equip => (
                                            <div key={equip} className="space-y-3">
                                                <div className="flex items-center justify-between px-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1 h-4 rounded-full ${config.progressColor}`} />
                                                        <h3 className={`text-[11px] font-black uppercase tracking-widest ${config.accentText}`}>{equip}</h3>
                                                    </div>
                                                </div>
                                                <KanbanColumn id={`${team}-${equip}`} team={team} cards={teamCards.filter(c => c.equipment === equip)}>
                                                    <div className="flex flex-col gap-3">
                                                        {teamCards.filter(c => c.equipment === equip).map(card => (
                                                            <SortableCardItem key={card.id} card={card} openEditCard={openEditCard} onToggleStatus={handleToggleStatus} onToggleSubTask={handleToggleSubTask} />
                                                        ))}
                                                    </div>
                                                </KanbanColumn>
                                            </div>
                                        ))}
                                        {isAdmin && (
                                            <button onClick={openNewCard} className="mt-2 w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-white transition-all flex flex-col items-center justify-center gap-1 group">
                                                <Plus size={20} className="group-hover:scale-110" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Novo Item</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </DndContext>

                {/* Mural de Recados com Deletar para Admins */}
                <div className="min-w-[320px] bg-white border border-slate-200 rounded-[2.5rem] shadow-xl flex flex-col overflow-hidden mb-4">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/10 text-white"><MessageSquare size={18} /></div>
                            <span className="font-black text-sm uppercase tracking-widest text-slate-800">Mural Mensal</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-hide">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 italic py-20 text-center">
                                <MessageSquare size={40} className="mb-2 opacity-10" />
                                <p className="text-xs font-bold uppercase tracking-widest opacity-40">Sem avisos</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className="relative bg-slate-50 p-4 rounded-2xl border border-slate-100 group/msg">
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed pr-6">{msg.text}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] font-black text-blue-600 uppercase">{msg.userName}</span>
                                        <span className="text-[9px] font-bold text-slate-300">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDeleteMessage(msg.id)}
                                            className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover/msg:opacity-100 transition-all rounded-lg"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-100">
                        <input
                            type="text"
                            placeholder="Postar no mural..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage((e.target as HTMLInputElement).value);
                                    (e.target as HTMLInputElement).value = '';
                                }
                            }}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                        />
                    </div>
                </div>
            </div>

            {/* Barra de Busca e Filtro de Equipamento (WELL VISIBLE) */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 shadow-2xl px-6 py-2 rounded-2xl flex items-center gap-6 border border-white/10 z-[100] backdrop-blur-md">
                {/* Search */}
                <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-white text-sm font-bold placeholder:text-slate-600 border-none focus:ring-0 w-32 focus:w-48 transition-all"
                    />
                </div>

                {/* Equipment Filter Pills */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-white/40 mr-2 border-r border-white/5 pr-4">
                        <Filter size={14} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Equipamento</span>
                    </div>
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => setEquipmentFilter('Todos')}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${equipmentFilter === 'Todos' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                        >
                            Todos
                        </button>
                        {EQUIPMENTS.map(eq => (
                            <button
                                key={eq}
                                onClick={() => setEquipmentFilter(eq)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${equipmentFilter === eq ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                            >
                                {eq}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <CardModal
                isOpen={isOpen}
                onClose={closeModal}
                card={editingCard}
                onSave={handleSaveCard}
                onDelete={handleDeleteCard}
                isAdmin={isAdmin}
            />
        </div>
    );
}
