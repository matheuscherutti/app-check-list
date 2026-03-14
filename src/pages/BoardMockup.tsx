import { useState } from 'react';
import { Search, Plus, MessageSquare, CheckCircle2, Circle, ChevronDown, ChevronRight, Menu } from 'lucide-react';

// Tipos mockados para o teste visual
type Status = 'Pendente' | 'Concluído';
type Equipment = 'A320' | 'A330' | 'ATR' | 'ERJ' | 'Cmros';

interface MockCard {
    id: string;
    title: string;
    team: string;
    equipment: Equipment;
    status: Status;
}

const MOCK_CARDS: MockCard[] = [
    { id: '1', title: 'Revisar Manuais de Voo', team: 'PRÉ ASSIGMENT', equipment: 'A320', status: 'Pendente' },
    { id: '2', title: 'Escala de Tripulação', team: 'PRÉ ASSIGMENT', equipment: 'ERJ', status: 'Concluído' },
    { id: '3', title: 'Revisar Manuais de Voo', team: 'PRÉ ASSIGMENT', equipment: 'A330', status: 'Pendente' },
    { id: '4', title: 'Revisar Manuais de Voo', team: 'PRÉ ASSIGMENT', equipment: 'ATR', status: 'Pendente' },
    { id: '5', title: 'Revisar Manuais de Voo', team: 'PRÉ ASSIGMENT', equipment: 'Cmros', status: 'Concluído' },

    { id: '6', title: 'Atualização de Cartas Nav', team: 'JEPPESEN', equipment: 'A320', status: 'Concluído' },

    { id: '7', title: 'Check de Simulador', team: 'CAE', equipment: 'A330', status: 'Pendente' },
    { id: '8', title: 'Treinamento SGSO', team: 'CAE', equipment: 'ATR', status: 'Pendente' },
];

const EQUIPMENTS: Equipment[] = ['A320', 'A330', 'ATR', 'ERJ', 'Cmros'];
const TEAMS = ['PRÉ ASSIGMENT', 'JEPPESEN', 'CAE'];

export default function BoardMockup() {
    const [selectedEquip, setSelectedEquip] = useState<Equipment | 'Todos'>('Todos');
    const [showSidebar, setShowSidebar] = useState(true);
    const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({
        'PRÉ ASSIGMENT': true,
        'JEPPESEN': true,
        'CAE': true
    });

    const toggleTeam = (team: string) => {
        setExpandedTeams(prev => ({ ...prev, [team]: !prev[team] }));
    };

    const renderCard = (card: MockCard) => {
        const isCompleted = card.status === 'Concluído';
        return (
            <div key={card.id} className={`bg-white border outline outline-1 outline-offset-[-1px] ${isCompleted ? 'outline-emerald-200 border-emerald-100' : 'outline-slate-200 border-slate-100'} rounded-[1.25rem] p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex items-center justify-between cursor-pointer group`}>
                <div className="flex items-center gap-3 min-w-0">
                    <button className="text-slate-300 hover:text-slate-400 cursor-grab active:cursor-grabbing pl-1">
                        <Menu size={16} strokeWidth={2.5} />
                    </button>
                    <span className={`text-[13px] font-bold truncate ${isCompleted ? 'text-emerald-500' : 'text-slate-700'}`}>
                        {card.title}
                    </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 pl-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100/80 px-3 py-1 rounded-md border border-slate-200/60">
                        {card.equipment}
                    </span>
                    <button className={`${isCompleted ? 'text-emerald-400' : 'text-slate-200 hover:text-blue-500'}`}>
                        {isCompleted ? <CheckCircle2 size={22} className="fill-emerald-50" strokeWidth={2.5} /> : <Circle size={22} strokeWidth={2.5} />}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-73px)] bg-[#f8fafc] overflow-hidden text-slate-800 font-sans">

            {/* 1. Header de Controles - IDÊNTICO À IMAGEM */}
            <header className="bg-white border-b border-slate-100 px-6 py-5 shrink-0 z-10 overflow-x-auto no-scrollbar">
                <div className="w-full min-w-[1200px] flex items-center justify-between">

                    {/* ESQUERDA: Dashboards Ampliados (Limitado à Esquerda) */}
                    <div className="flex items-center gap-10 xl:gap-16">
                        {/* Circular Progress (Maior) */}
                        <div className="flex items-center gap-4 shrink-0">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <svg width="64" height="64" className="transform -rotate-90">
                                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="#2563eb" strokeWidth="4" strokeDasharray="175.9" strokeDashoffset="35.18" strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-xs font-black text-blue-600">80%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-600">Status Geral</span>
                            </div>
                        </div>

                        {/* Barras Horizontais Largas */}
                        <div className="flex items-center gap-6 xl:gap-8 ml-4">
                            {EQUIPMENTS.map(eq => (
                                <div key={eq} className="w-20 xl:w-28">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 mb-2">
                                        <span className="tracking-widest">{eq}</span>
                                        <span className="text-blue-600">50%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 w-1/2 rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DIREITA: Filtros, Busca e Add */}
                    <div className="flex items-center gap-8 shrink-0">

                        {/* Equipamentos Filtro */}
                        <div className="flex items-center gap-2">
                            {['Todos', ...EQUIPMENTS].map((eq) => {
                                const isSelected = selectedEquip === eq;
                                return (
                                    <button
                                        key={eq}
                                        onClick={() => setSelectedEquip(eq as any)}
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

                        {/* Busca e Add */}
                        <div className="flex items-center gap-3">
                            <div className="relative w-56">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium placeholder-slate-300 shadow-sm"
                                />
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-md shadow-blue-600/20 active:scale-95 transition-all outline-none shrink-0">
                                <Plus size={18} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. Área Central (Scrollável) */}
            <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                <div className="w-full flex gap-6 relative items-start">

                    {/* Feed Principal de Equipes (Acordeões) */}
                    <div className="flex-1 flex flex-col gap-5 pb-32">
                        {TEAMS.map(team => {
                            const teamCards = MOCK_CARDS.filter(c => c.team === team && (selectedEquip === 'Todos' || c.equipment === selectedEquip));
                            const totalCards = teamCards.length;
                            const completedCards = teamCards.filter(c => c.status === 'Concluído').length;
                            const isExpanded = expandedTeams[team];

                            return (
                                <div key={team} className="bg-white border border-slate-200/70 shadow-sm rounded-3xl overflow-hidden transition-all duration-300">
                                    {/* Cabeçalho da Equipe */}
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

                                        {/* Contadores Refinados */}
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

                                    {/* Corpo Expansível */}
                                    <div className={`transition-all duration-300 ease-in-out px-6 ${isExpanded ? 'max-h-[2000px] opacity-100 pb-6' : 'max-h-0 opacity-0 pb-0 overflow-hidden'}`}>
                                        {teamCards.length === 0 ? (
                                            <div className="py-6 text-center bg-slate-50/80 rounded-[1.25rem] border border-dashed border-slate-200 text-xs font-medium text-slate-400 italic">
                                                Nenhum card encontrado com os filtros atuais.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                                {teamCards.map(card => renderCard(card))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 3. Painel Lateral (Mural de Recados Fixo do lado direito) */}
                    {showSidebar && (
                        <aside className="w-[320px] shrink-0 bg-white border border-slate-200/70 rounded-[2rem] sticky top-0 shadow-sm flex flex-col overflow-hidden h-[fit-content] max-h-[85vh]">
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

                            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                                {/* Mock Post */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 outline outline-1 outline-offset-[-1px] outline-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all">
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
                                        Atenção equipe CAE, documentação de Março precisa ser validada até o dia 20/03.
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100/60">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                                                <span className="text-[9px] text-blue-600 font-bold">M</span>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-700 tracking-wide">Matheus</span>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400">13/03/2026</span>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}

                    {/* Botão flutuante para mostrar Mural se estiver fechado */}
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
        </div>
    );
}
