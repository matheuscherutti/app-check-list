import { Outlet, Link } from 'react-router-dom';
import { useUserStore } from '../../stores/useUserStore';
import { LogOut, Settings, LayoutDashboard, ScrollText } from 'lucide-react';
import { useFilterStore } from '../../stores/useFilterStore';
import MonthTabs from './MonthTabs';
export default function Layout() {
    const { currentUser, logout } = useUserStore();
    const { selectedMonth, setSelectedMonth } = useFilterStore();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Navbar */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6 flex-1">
                    <div className="flex items-center gap-4">
                        <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-lg shadow-sm border border-slate-200" />
                        <h1 className="text-xl font-bold text-slate-900 mr-8 whitespace-nowrap hidden lg:block tracking-tight">
                            Check List Aeronautas
                        </h1>
                    </div>

                    <nav className="flex items-center gap-4 hidden sm:flex">
                        <Link to="/board" className="text-slate-600 hover:text-primary-600 flex items-center gap-2 font-medium transition-colors whitespace-nowrap">
                            <LayoutDashboard size={18} /> Board
                        </Link>
                        <Link to="/audit" className="text-slate-600 hover:text-primary-600 flex items-center gap-2 font-medium transition-colors whitespace-nowrap">
                            <ScrollText size={18} /> Auditoria
                        </Link>
                        <Link to="/settings" className="text-slate-600 hover:text-primary-600 flex items-center gap-2 font-medium transition-colors whitespace-nowrap">
                            <Settings size={18} /> Equipe
                        </Link>
                    </nav>
                </div>

                <div className="hidden xl:flex flex-[1.5] justify-start items-center xl:-ml-8 2xl:-ml-20">
                    <MonthTabs selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />
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
            <main className="flex-1 flex flex-col bg-background">
                <Outlet />
            </main>
        </div>
    );
}
