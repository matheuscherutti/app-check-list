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
    addMessage,
    updateMonthlyCardData,
    auditLog
} from '../lib/firestoreService';
import type { Message } from '../lib/firestoreService';

// Mock data initially to help build the UI
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
        selectedMonth, setEquipmentFilter
    } = useFilterStore();

    const { openCardModal, closeModal } = useModalStore();
    const { currentUser } = useUserStore();

    const [cards, setCards] = useState<Card[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [activeCard, setActiveCard] = useState<Card | null>(null);
    const [showSidebar, setShowSidebar] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({
        'Pré Assigment': true,
        'Jeppesen': true,
        'CAE': true
    });

    // Subscriptions
    useEffect(() => {
        const unsubCards = subscribeToCards((allCards) => {
            setCards(allCards);
        });
        const unsubMessages = subscribeToMessages((msgs) => {
            setMessages(msgs);
        });
        const unsubMonthlyData = subscribeToMonthlyData((data) => {
            setMonthlyData(data);
        });

        return () => {
            unsubCards();
            unsubMessages();
            unsubMonthlyData();
        };
    }, []);

    // Filter cards
    const filteredCards = useMemo(() => {
        return cards.filter(card => {
            const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'Todos' || card.status === statusFilter;
            const matchesTeam = teamFilter === 'Todos' || card.team === teamFilter;
            const matchesEquipment = equipmentFilter === 'Todos' || card.equipment === equipmentFilter;

            return matchesSearch && matchesStatus && matchesTeam && matchesEquipment;
        });
    }, [cards, searchQuery, statusFilter, teamFilter, equipmentFilter]);

    // Grouping
    const allEqGroups: EquipmentGroup[] = ['A320', 'A330', 'ATR', 'ERJ', 'Cmros'];

    // Dndkit sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Card') {
            setActiveCard(event.active.data.current.card);
            return;
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        // Handle dragging over different areas
    };

    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCard(null);

        if (!over) return;

        const activeCard = active.data.current?.card as Card;
        if (!activeCard) return;

        // Extract column path for reordering
        const overId = over.id as string;

        // Logical reordering would go here
        // For simplicity in UI tasks, we are skipping full logic if not requested
    };

    const handleToggleStatus = async (card: Card) => {
        const newStatus = card.status === 'Concluído' ? 'Pendente' : 'Concluído';

        // Log auditing
        await auditLog({
            user: currentUser?.name || 'Sistema',
            action: 'EDIT_STATUS',
            context: {
                targetMonth: selectedMonth,
                equipment: card.equipment,
                team: card.team
            },
            message: `Atividade "${card.title}" alterada de ${card.status} para ${newStatus}`
        });

        await upsertCard({ ...card, status: newStatus });
    };

    const handleToggleSubTask = async (card: Card, subTaskId: string) => {
        if (!card.subTasks) return;
        const newSubTasks = card.subTasks.map(st =>
            st.id === subTaskId
                ? { ...st, status: (st.status === 'Concluído' ? 'Pendente' : 'Concluído') as any }
                : st
        );

        // If all subtasks completed, set main card to Concluído?
        const allDone = newSubTasks.every(st => st.status === 'Concluído');
        const newStatus = allDone ? 'Concluído' : 'Pendente';

        await upsertCard({ ...card, subTasks: newSubTasks, status: newStatus });
    };

    const toggleTeam = (team: string) => {
        setExpandedTeams(prev => ({ ...prev, [team]: !prev[team] }));
    };

    const openEditCard = (card: Card) => {
        openCardModal(card);
    };

    const openNewCard = () => {
        openCardModal();
    };

    const handleAddMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        await addMessage({
            text: newMessage,
            authorId: currentUser.id,
            authorName: currentUser.name,
            createdAt: Date.now()
        });
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-73px)] bg-[#f8fafc] overflow-hidden text-slate-800 font-sans">
            {/* 1. Header de Controles */}
            <header className="bg-white border-b border-slate-100 px-6 py-5 shrink-0 z-10 overflow-x-auto no-scrollbar">
                <div className="w-full min-w-[1200px] flex items-center justify-between">
                    {/* ESQUERDA: Dashboards ou Stats */}
                    <div className="flex items-center gap-10">
                        {/* Placeholder for real stats if needed */}
                        <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <svg width="48" height="48" className="transform -rotate-90">
                                    <circle cx="24" cy="24" r="20" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                                    <circle cx="24" cy="24" r="20" fill="transparent" stroke="#2563eb" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset="31.4" strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-[10px] font-black text-blue-600">75%</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Status Geral</span>
                        </div>

                        {/* Equipments Bars */}
                        <div className="flex gap-6 items-center">
                            {allEqGroups.map(eq => (
                                <div key={eq} className="w-20">
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">
                                        <span>{eq}</span>
                                        <span className="text-blue-600">50%</span>
                                    </div>
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DIREITA: Filtros */}
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            {['Todos', ...allEqGroups].map((eq) => {
                                const isSelected = equipmentFilter === eq;
                                return (
                                    <button
                                        key={eq}
                                        onClick={() => setEquipmentFilter(eq as any)}
                                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${isSelected
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                                : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                                            }`}
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
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar atividade..."
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
                    <div className="flex-1 flex flex-col gap-8 pb-32">
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
                                const config = TEAM_CONFIG[team];

                                return (
                                    <div key={team} className="bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden transition-all duration-300 border border-slate-100">
                                        <button
                                            onClick={() => toggleTeam(team)}
                                            className={`w-full px-8 py-5 flex items-center justify-between transition-all focus:outline-none ${config.headerBg} ${isExpanded ? 'rounded-b-none' : ''}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-white/70">
                                                    {isExpanded ? <ChevronDown size={20} strokeWidth={3} /> : <ChevronRight size={20} strokeWidth={3} />}
                                                </div>
                                                <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-white">{team}</h2>
                                            </div>

                                            <div className="flex items-center gap-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none">Status:</span>
                                                    <span className="text-white text-[14px] font-extrabold leading-none">{completedCards} / {totalCards}</span>
                                                </div>

                                                <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden hidden sm:block">
                                                    <div
                                                        className="h-full bg-white transition-all duration-700 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                                                        style={{ width: totalCards === 0 ? '0%' : `${(completedCards / totalCards) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </button>

                                        <div className={`transition-all duration-500 ease-in-out ${config.lightBg} ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                            <KanbanColumn id={columnId} team={team} cards={teamCards}>
                                                <div className="space-y-12 p-8">
                                                    {equipmentFilter === 'Todos' ? (
                                                        allEqGroups.map(eq => {
                                                            const eqCards = teamCards.filter(c => c.equipment === eq);
                                                            if (eqCards.length === 0) return null;

                                                            return (
                                                                <div key={eq} className="space-y-5">
                                                                    <div className="flex items-center gap-3 pl-2">
                                                                        <div className={`w-1 h-4 rounded-full ${config.progressColor}`} />
                                                                        <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${config.accentText}`}>{eq}</h3>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
                                                        <div className="py-20 text-center">
                                                            <p className="text-slate-400 text-xs font-medium italic">Sem atividades registradas com os filtros atuais.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </KanbanColumn>
                                        </div>
                                    </div>
                                );
                            })}
                        </DndContext>
                    </div>

                    {/* 3. Painel Lateral (Mural) */}
                    {showSidebar && (
                        <aside className="w-[320px] shrink-0 bg-white border border-slate-100 rounded-[2rem] sticky top-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden h-[fit-content] max-h-[85vh]">
                            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <MessageSquare size={16} className="text-blue-500 transform -scale-x-100" strokeWidth={2.5} />
                                    <div>
                                        <h2 className="text-[12px] font-black uppercase tracking-[0.15em] text-slate-800">Mural de Recados</h2>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Alertas Operacionais</p>
                                    </div>
                                </div>
                                <button className="text-slate-300 hover:text-slate-500" onClick={() => setShowSidebar(false)}>
                                    <ChevronRight size={18} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                                {messages.map(msg => (
                                    <div key={msg.id} className="bg-white p-5 rounded-2x border border-slate-50 shadow-sm hover:shadow-md transition-all">
                                        <p className="text-xs text-slate-600 leading-relaxed mb-4">{msg.text}</p>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center">
                                                    <span className="text-[9px] text-blue-600 font-bold">{msg.authorName[0]}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-700">{msg.authorName}</span>
                                            </div>
                                            <span className="text-[8px] font-bold text-slate-400">
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleAddMessage} className="p-4 border-t border-slate-50 bg-slate-50/30">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Escrever recado..."
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                                />
                            </form>
                        </aside>
                    )}
                </div>
            </div>

            <CardModal
                isOpen={!!openCardModal}
                onClose={() => {
                    closeModal();
                    setActiveCard(null);
                }}
            />
        </div>
    );
}
