import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import type { Workspace } from '../../types';

interface WorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Workspace>) => void;
    workspace?: Workspace | null;
}

export default function WorkspaceModal({ isOpen, onClose, onSave, workspace }: WorkspaceModalProps) {
    const [name, setName] = useState('');
    const [sectors, setSectors] = useState<string[]>([]);
    const [teams, setTeams] = useState<string[]>([]);
    const [newSector, setNewSector] = useState('');
    const [newTeam, setNewTeam] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(workspace?.name || '');
            setSectors(workspace?.sectors || []);
            setTeams(workspace?.teams || []);
            setNewSector('');
            setNewTeam('');
        }
    }, [workspace, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave({
                name: name.trim(),
                sectors,
                teams
            });
            setName('');
        }
    };

    const addSector = () => {
        if (newSector.trim() && !sectors.includes(newSector.trim())) {
            setSectors([...sectors, newSector.trim()]);
            setNewSector('');
        }
    };

    const removeSector = (index: number) => {
        setSectors(sectors.filter((_, i) => i !== index));
    };

    const addTeam = () => {
        if (newTeam.trim() && !teams.includes(newTeam.trim())) {
            setTeams([...teams, newTeam.trim()]);
            setNewTeam('');
        }
    };

    const removeTeam = (index: number) => {
        setTeams(teams.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">
                        {workspace ? 'Configurações da Categoria' : 'Nova Categoria'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-red-500 shadow-sm border border-transparent hover:border-slate-100">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                Nome da Categoria
                            </label>
                            <input
                                autoFocus
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Monitoramento, Diárias, RH..."
                                className="w-full px-4 py-3 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 placeholder:text-slate-300"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Sectors / Equipment Group */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-2">
                                    Setores / Equipamentos
                                    <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[9px]">{sectors.length}</span>
                                </h4>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newSector}
                                        onChange={(e) => setNewSector(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSector())}
                                        placeholder="Novo setor..."
                                        className="flex-1 text-sm border-slate-200 rounded-xl px-4 py-2 focus:ring-blue-500 font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={addSector}
                                        className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {sectors.map((s, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group transition-all hover:border-blue-200 hover:bg-blue-50/30">
                                            <span className="text-sm font-bold text-slate-700">{s}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeSector(idx)}
                                                className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {sectors.length === 0 && (
                                        <p className="text-center text-[11px] text-slate-400 py-4 italic border-2 border-dashed border-slate-100 rounded-xl uppercase tracking-wider font-black">Nenhum setor definido</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Teams */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-2">
                                    Times / Equipes
                                    <span className="bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded text-[9px]">{teams.length}</span>
                                </h4>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newTeam}
                                        onChange={(e) => setNewTeam(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTeam())}
                                        placeholder="Novo time..."
                                        className="flex-1 text-sm border-slate-200 rounded-xl px-4 py-2 focus:ring-emerald-500 font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTeam}
                                        className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {teams.map((t, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group transition-all hover:border-emerald-200 hover:bg-emerald-50/30">
                                            <span className="text-sm font-bold text-slate-700">{t}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeTeam(idx)}
                                                className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {teams.length === 0 && (
                                        <p className="text-center text-[11px] text-slate-400 py-4 italic border-2 border-dashed border-slate-100 rounded-xl uppercase tracking-wider font-black">Nenhum time definido</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-8 py-4 border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-100 transition-all active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        type="submit"
                        className="flex-[2] px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-black shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        <Save size={18} />
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
}
