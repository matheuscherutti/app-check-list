import { Outlet, Link } from 'react-router-dom';
import { useUserStore } from '../../stores/useUserStore';
import { LogOut, Settings, LayoutDashboard, ScrollText } from 'lucide-react';
import { useFilterStore } from '../../stores/useFilterStore';
import MonthTabs from './MonthTabs';
import { useWorkspaceStore, WORKSPACES } from '../../stores/useWorkspaceStore';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Layout() {
    const { currentUser, logout } = useUserStore();
    const { selectedMonth, setSelectedMonth } = useFilterStore();
    const { activeWorkspaceId, setActiveWorkspaceId, getActiveWorkspace } = useWorkspaceStore();
    const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeWorkspace = getActiveWorkspace();

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsWorkspaceMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Navbar */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6 flex-1">
                    <div className="flex items-center gap-4">
                        <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-lg shadow-sm border border-slate-200" />
                        <h1 className="text-xl font-bold text-slate-900 mr-2 whitespace-nowrap hidden lg:block tracking-tight">
                            Central de Informações
                        </h1>
                    </div>

                    <div className="flex items-center gap-8 pl-4 border-l border-slate-200">
                        {/* Workspace Selector */}
                        <div className="relative" ref={dropdownRef}>
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
                                <div className="absolute top-[calc(100%+8px)] left-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                                    <div className="grid gap-1">
                                        {WORKSPACES.map(ws => (
                                            <button
                                                key={ws.id}
                                                onClick={() => {
                                                    setActiveWorkspaceId(ws.id);
                                                    setIsWorkspaceMenuOpen(false);
                                                }}
                                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-left ${activeWorkspaceId === ws.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}
                                            >
                                                <div className={`p-1.5 rounded-lg ${activeWorkspaceId === ws.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                    <LayoutDashboard size={16} />
                                                </div>
                                                <span className="text-sm font-bold">{ws.name}</span>
                                            </button>
                                        ))}
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
                        <Link to="/audit" className="text-slate-500 hover:text-blue-600 flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap">
                            <ScrollText size={16} /> Auditoria
                        </Link>
                        <Link to="/settings" className="text-slate-500 hover:text-blue-600 flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap">
                            <Settings size={16} /> Equipe
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm">
                        <span className="text-slate-500">Logado como: </span>
                        <span className="font-semibold text-slate-800">{currentUser?.name}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        title="Sair"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col bg-slate-50">
                <Outlet />
            </main>
        </div>
    );
}
