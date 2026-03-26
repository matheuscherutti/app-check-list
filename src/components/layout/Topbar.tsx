import { Search, Plus } from 'lucide-react';
import { useFilterStore } from '../../stores/useFilterStore';
import { useModalStore } from '../../stores/useModalStore';

export default function Topbar() {
    const {
        searchQuery, setSearchQuery
    } = useFilterStore();
    const { openNewCard } = useModalStore();

    return (
        <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs focus:ring-2 focus:ring-primary-600 transition-all placeholder-slate-400 font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <button
                onClick={() => openNewCard()}
                className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-xl shadow-lg shadow-primary-600/20 active:scale-95 transition-all outline-none"
                title="Novo Cartão"
            >
                <Plus size={20} />
            </button>
        </div>
    );
}
