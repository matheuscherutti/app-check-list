import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/useUserStore';
import { LogOut, Settings, LayoutDashboard, ScrollText, Users, ChevronDown, Plus, Trash2, DownloadCloud } from 'lucide-react';
import { useFilterStore } from '../../stores/useFilterStore';
import MonthTabs from './MonthTabs';
import WorkspaceModal from '../shared/WorkspaceModal';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useState, useRef, useEffect } from 'react';
import { subscribeToWorkspaces, upsertWorkspace, deleteWorkspace } from '../../lib/firestoreService';
import { exportWorkspaceDataToCSV } from '../../lib/exportData';
import type { Workspace } from '../../types';

export default function Layout() {
    const { currentUser, logout } = useUserStore();
    const { selectedMonth, setSelectedMonth } = useFilterStore();
    const { activeWorkspaceId, setActiveWorkspaceId, getActiveWorkspace, workspaces, setWorkspaces } = useWorkspaceStore();
    const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
    const workspaceDropdownRef = useRef<HTMLDivElement>(null);
    const settingsDropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();

    const activeWorkspace = getActiveWorkspace();

    // Subscribe to workspaces
    useEffect(() => {
        const unsubscribe = subscribeToWorkspaces((wsList) => {
            if (wsList.length === 0) {
                // Seed initial ones to preserve existing data access
                const defaultSectors = ['A320', 'A330', 'ATR', 'ERJ', 'Cmros'];
                const defaultTeams = ['Pré Assigment', 'Jeppesen', 'CAE'];

                const initial: Workspace[] = [
                    { id: 'escalas', name: 'Check List - Escalas', isProtected: true, order: 0, sectors: defaultSectors, teams: defaultTeams },
                    { id: 'payroll', name: 'Check List Payroll', order: 1, sectors: [], teams: [] },
                    { id: 'diarias', name: 'Check List Diárias', order: 2, sectors: [], teams: [] },
                    { id: 'treinamento', name: 'Check List Treinamento', order: 3, sectors: [], teams: [] }
                ];
                initial.forEach(ws => upsertWorkspace(ws));
            } else {
                setWorkspaces(wsList);
            }
        });
        return () => unsubscribe();
    }, [setWorkspaces]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (workspaceDropdownRef.current && !workspaceDropdownRef.current.contains(event.target as Node)) {
                setIsWorkspaceMenuOpen(false);
            }
            if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
                setIsSettingsMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddWorkspace = () => {
        setEditingWorkspace(null);
        setIsModalOpen(true);
        setIsWorkspaceMenuOpen(false);
    };

    const handleEditWorkspace = (e: React.MouseEvent, ws: Workspace) => {
        e.stopPropagation();
        setEditingWorkspace(ws);
        setIsModalOpen(true);
        setIsWorkspaceMenuOpen(false);
    };

    const handleDeleteWorkspace = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (id === 'escalas') return;
        if (window.confirm('Tem certeza que deseja excluir esta categoria? Os cartões vinculados a ela permanecerão no banco, mas não serão listados até que você crie uma categoria com o mesmo ID ou os mova manualmente.')) {
            await deleteWorkspace(id);
            if (activeWorkspaceId === id) {
                setActiveWorkspaceId('escalas');
            }
        }
    };

    const handleSaveWorkspace = async (data: Partial<Workspace>) => {
        const id = editingWorkspace?.id || data.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') || '';
        await upsertWorkspace({
            id,
            name: data.name || '',
            sectors: data.sectors || [],
            teams: data.teams || [],
            isProtected: editingWorkspace?.isProtected || false,
            order: editingWorkspace?.order ?? workspaces.length,
            createdAt: editingWorkspace?.createdAt || Date.now()
        });
        setIsModalOpen(false);
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Navbar */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6 flex-1">
                    <Link to="/board" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                        <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-lg shadow-sm border border-slate-200" />
                        <div className="hidden lg:flex flex-col items-center bg-white px-5 py-1.5 rounded-2xl border border-slate-100 shadow-sm leading-[1.1] ml-2">
                            <span className="text-[15px] font-black text-[#1e3a8a] uppercase tracking-tighter">Central de Controle</span>
                            <div className="w-full h-[1.5px] bg-slate-100 my-1" />
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Monitoramento Geral</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-8 pl-4 border-l border-slate-200">
                        {/* Workspace Selector */}
                        <div className="relative" ref={workspaceDropdownRef}>
                            <button
                                onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                                className="flex items-center gap-3 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 group"
                            >
                                <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                    <LayoutDashboard size={16} />
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Workspaces</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-bold text-slate-800">{activeWorkspace.name}</span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isWorkspaceMenuOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                            </button>

                            {isWorkspaceMenuOpen && (
                                <div className="absolute top-[calc(100%+8px)] left-0 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                                    <div className="grid gap-1 mb-2 max-h-[60vh] overflow-y-auto">
                                        {workspaces.map(ws => (
                                            <div
                                                key={ws.id}
                                                onClick={() => {
                                                    setActiveWorkspaceId(ws.id);
                                                    setIsWorkspaceMenuOpen(false);
                                                }}
                                                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all text-left cursor-pointer group/item ${activeWorkspaceId === ws.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-lg ${activeWorkspaceId === ws.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                        <LayoutDashboard size={16} />
                                                    </div>
                                                    <span className="text-sm font-bold">{ws.name}</span>
                                                </div>

                                                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => handleEditWorkspace(e, ws)}
                                                        className="p-1.5 hover:bg-blue-100 rounded-md text-slate-400 hover:text-blue-600"
                                                        title="Configurar Setores e Equipes"
                                                    >
                                                        <Settings size={12} />
                                                    </button>
                                                    {!ws.isProtected && (
                                                        <button
                                                            onClick={(e) => handleDeleteWorkspace(e, ws.id)}
                                                            className="p-1.5 hover:bg-red-100 rounded-md text-slate-400 hover:text-red-500"
                                                            title="Excluir Categoria"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-2 border-t border-slate-100">
                                        <button
                                            onClick={handleAddWorkspace}
                                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 transition-all text-left"
                                        >
                                            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                                                <Plus size={16} />
                                            </div>
                                            <span className="text-sm font-bold">Novo Workspace</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Month Filter Moved Left */}
                        <div className="hidden lg:flex items-center">
                            <MonthTabs selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />
                        </div>
                    </div>

                    <nav className="flex items-center gap-4 hidden sm:flex ml-4 border-l border-slate-100 pl-4">
                        <Link
                            to="/board"
                            className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-colors px-3 py-2 rounded-lg ${location.pathname === '/board' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'}`}
                        >
                            <LayoutDashboard size={16} /> Painéis
                        </Link>

                        {/* Settings Dropdown for Auditoria/Equipe */}
                        <div className="relative" ref={settingsDropdownRef}>
                            <button
                                onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                                className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all px-3 py-2 rounded-lg ${isSettingsMenuOpen || location.pathname === '/audit' || location.pathname === '/settings' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                            >
                                <Settings size={16} className={isSettingsMenuOpen ? 'rotate-90 transition-transform' : 'transition-transform'} />
                                Configurações
                                <ChevronDown size={14} className={`transition-transform duration-200 ${isSettingsMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isSettingsMenuOpen && (
                                <div className="absolute top-[calc(100%+8px)] right-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                                    <Link
                                        to="/audit"
                                        onClick={() => setIsSettingsMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === '/audit' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'}`}
                                    >
                                        <ScrollText size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Auditoria</span>
                                    </Link>
                                    <Link
                                        to="/settings"
                                        onClick={() => setIsSettingsMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === '/settings' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'}`}
                                    >
                                        <Users size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Equipe</span>
                                    </Link>

                                    <div className="my-1 border-t border-slate-100" />

                                    <button
                                        onClick={() => {
                                            setIsSettingsMenuOpen(false);
                                            exportWorkspaceDataToCSV(activeWorkspaceId, selectedMonth);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
                                    >
                                        <DownloadCloud size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Backup CSV</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm hidden md:block">
                        <span className="text-slate-500 font-medium">Logado como: </span>
                        <span className="font-bold text-slate-800">{currentUser?.name}</span>
                    </div>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                        title="Sair"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <WorkspaceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveWorkspace}
                workspace={editingWorkspace}
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col bg-slate-50">
                <Outlet />
            </main>
        </div>
    );
}
