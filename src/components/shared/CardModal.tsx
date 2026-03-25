import { useState, useEffect } from 'react';
import { X, Plus, Trash2, MessageSquare } from 'lucide-react';
import type { Card, EquipmentGroup, Team, SubTask } from '../../types';

interface CardModalProps {
    isOpen: boolean;
    onClose: () => void;
    card?: Card;
    onDelete?: (id: string) => void;
    onSave: (data: Partial<Card>) => void;
}

const GROUPS: EquipmentGroup[] = ['A320', 'A330', 'ATR', 'ERJ', 'Cmros'];
const TEAMS: Team[] = ['Pré Assigment', 'Jeppesen', 'CAE'];

export default function CardModal({ isOpen, onClose, card, onDelete, onSave }: CardModalProps) {
    const isEditing = !!card;

    const [title, setTitle] = useState('');
    const [equipment, setEquipment] = useState<EquipmentGroup>('A320');
    const [team, setTeam] = useState<Team>('Pré Assigment');

    // Multi task state
    const [isMultiTask, setIsMultiTask] = useState(false);
    const [subTasks, setSubTasks] = useState<SubTask[]>([]);
    const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

    // Comments (Notes) state
    const [notes, setNotes] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            if (card) {
                setTitle(card.title);
                setEquipment(card.equipment);
                setTeam(card.team);
                setIsMultiTask(card.isMultiTask || false);
                setSubTasks(card.subTasks || []);
                setNotes(card.notes || '');
            } else {
                setTitle('');
                setEquipment('A320');
                setTeam('Pré Assigment');
                setIsMultiTask(false);
                setSubTasks([]);
                setNotes('');
            }
        }
    }, [isOpen, card]);

    if (!isOpen) return null;

    const handleAddSubTask = () => {
        if (!newSubTaskTitle.trim()) return;
        setSubTasks([...subTasks, {
            id: Math.random().toString(36).substr(2, 9),
            title: newSubTaskTitle,
            status: 'Pendente'
        }]);
        setNewSubTaskTitle('');
    };

    const handleRemoveSubTask = (id: string) => {
        setSubTasks(subTasks.filter(st => st.id !== id));
    };

    const handleConfirmDelete = () => {
        if (card && onDelete) {
            if (window.confirm('Tem certeza que deseja excluir permanentemente este card?')) {
                onDelete(card.id);
            }
        }
    };

    const handleSave = () => {
        onSave({
            title,
            equipment,
            team,
            isMultiTask,
            ...(isMultiTask ? { subTasks } : {}),
            notes
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">
                            {isEditing ? 'Detalhes da Atividade' : 'Nova Atividade'}
                        </h2>
                        {isEditing && (
                            <p className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-wider">ID: {card.id}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto flex-1 space-y-8">

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Título</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-primary-500 focus:border-primary-500 placeholder:text-slate-300"
                                placeholder="Descreva a atividade..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Equipamento</label>
                                <select
                                    value={equipment}
                                    onChange={(e) => setEquipment(e.target.value as EquipmentGroup)}
                                    className="w-full border-slate-200 rounded-xl p-3 text-sm font-bold bg-slate-50"
                                >
                                    {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Setor</label>
                                <select
                                    value={team}
                                    onChange={(e) => setTeam(e.target.value as Team)}
                                    className="w-full border-slate-200 rounded-xl p-3 text-sm font-bold"
                                >
                                    {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {!isMultiTask && (
                        <div className="flex items-center gap-3 p-4 bg-primary-50/50 border border-primary-100 rounded-xl group cursor-pointer" onClick={() => setIsMultiTask(true)}>
                            <div className="w-5 h-5 rounded border flex items-center justify-center transition-colors bg-white border-slate-300">
                                <Plus size={14} className="text-slate-400" />
                            </div>
                            <span className="text-sm font-bold text-primary-900">
                                Ativar Checklist (Multi-Tarefas)
                            </span>
                        </div>
                    )}

                    {isMultiTask && (
                        <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50 space-y-4">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Itens do Checklist</h3>

                            <div className="space-y-2">
                                {subTasks.map(st => (
                                    <div key={st.id} className="flex justify-between items-center bg-white p-3 text-sm font-bold text-slate-700 border border-slate-100 rounded-xl shadow-sm group">
                                        <span>{st.title}</span>
                                        <button onClick={() => handleRemoveSubTask(st.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {subTasks.length === 0 && <p className="text-center text-xs text-slate-400 py-4 italic">Nenhum item adicionado.</p>}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSubTaskTitle}
                                    onChange={(e) => setNewSubTaskTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubTask()}
                                    placeholder="Adicionar tarefa ao check..."
                                    className="flex-1 text-sm border-slate-200 rounded-xl p-3 focus:ring-primary-500"
                                />
                                <button
                                    onClick={handleAddSubTask}
                                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition-colors"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    )}

                    {isEditing && (
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                <MessageSquare size={14} /> Mural de Observações (Específico do Mês)
                            </label>
                            <textarea
                                rows={4}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Insira notas importantes sobre o andamento..."
                                className="w-full border-slate-200 rounded-xl p-4 text-sm font-medium focus:ring-primary-500 placeholder:text-slate-300 transition-shadow"
                            />
                            <p className="text-[10px] text-slate-400 italic">Essas notas ficam registradas apenas para o período selecionado.</p>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 px-8 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center">
                    <div>
                        {isEditing && (
                            <button
                                onClick={handleConfirmDelete}
                                className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-600 transition-colors p-2 -ml-2"
                            >
                                <Trash2 size={18} />
                                Excluir Card
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-8 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all active:scale-95"
                        >
                            {isEditing ? 'Atualizar Atividade' : 'Criar Atividade'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

