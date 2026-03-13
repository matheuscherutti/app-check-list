import { useEffect, useState } from 'react';
import {
    Clock,
    CheckCircle2,
    PlusCircle,
    Edit,
    Trash2,
    ArrowRightCircle,
    User,
    Calendar,
    Search,
    Filter
} from 'lucide-react';
import { subscribeToLogs } from '../lib/firestoreService';
import type { AuditEntry } from '../lib/firestoreService';

const getActionIcon = (action: AuditEntry['action']) => {
    switch (action) {
        case 'Criou': return <PlusCircle size={18} className="text-blue-500" />;
        case 'Editou': return <Edit size={18} className="text-amber-500" />;
        case 'Deletou': return <Trash2 size={18} className="text-red-500" />;
        case 'Moveu': return <ArrowRightCircle size={18} className="text-purple-500" />;
        case 'Concluiu': return <CheckCircle2 size={18} className="text-green-500" />;
        default: return <Clock size={18} className="text-slate-400" />;
    }
};

const getActionBadgeStyle = (action: AuditEntry['action']) => {
    switch (action) {
        case 'Criou': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'Editou': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'Deletou': return 'bg-red-50 text-red-700 border-red-200';
        case 'Moveu': return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'Concluiu': return 'bg-green-50 text-green-700 border-green-200';
        default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
};

export default function Audit() {
    const [searchTerm, setSearchTerm] = useState('');
    const [logs, setLogs] = useState<AuditEntry[]>([]);

    useEffect(() => {
        const unsub = subscribeToLogs(setLogs);
        return () => unsub();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-8 flex flex-col gap-8 max-w-5xl mx-auto w-full">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Histórico de Auditoria</h2>
                    <p className="text-slate-500 text-sm mt-1">Timeline de ações efetuadas pela equipe logada</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 transition-all"
                        />
                    </div>
                    <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary-600 hover:border-primary-200 transition-all">
                        <Filter size={20} />
                    </button>
                </div>
            </header>

            <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-slate-200 rounded-full" />

                {/* Log Entries */}
                <div className="space-y-8">
                    {filteredLogs.length === 0 ? (
                        <div className="ml-12 py-10 text-slate-400 italic">Nenhum log encontrado.</div>
                    ) : (
                        filteredLogs.map((log) => (
                            <div key={log.id} className="relative pl-12 sm:pl-16 group">
                                {/* Dot Icon */}
                                <div className="absolute left-0 sm:left-2 top-0 bg-white p-1 rounded-full z-10 border-2 border-slate-100 group-hover:border-primary-200 transition-colors shadow-sm">
                                    {getActionIcon(log.action)}
                                </div>

                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-primary-100 transition-all">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border mb-1 sm:mb-0 ${getActionBadgeStyle(log.action)}`}>
                                                {log.action}
                                            </span>
                                            <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                                                {log.target}
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-slate-600 text-sm mb-4 bg-slate-50/50 p-3 rounded-lg border border-dashed border-slate-200">
                                        {log.details}
                                    </p>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                                                <User size={12} className="text-primary-600" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">{log.user}</span>
                                        </div>
                                        <button className="text-[11px] font-bold text-primary-600 hover:text-primary-800 transition-colors">
                                            Ver Detalhes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="text-center pb-10">
                <button className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-all flex items-center gap-2 mx-auto">
                    <Clock size={16} />
                    Carregar logs mais antigos (limite de 50)
                </button>
            </div>
        </div>
    );
}
