import { useState, useEffect } from 'react';
import { UserPlus, UserCheck, Search, Trash2, Edit2, Shield, User as UserIcon } from 'lucide-react';
import { subscribeToUsers, upsertUser, deleteUser, auditLog } from '../lib/firestoreService';
import type { User } from '../stores/useUserStore';
import { useUserStore } from '../stores/useUserStore';

export default function Settings() {
    const [members, setMembers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingMember, setEditingMember] = useState<User | null>(null);
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState<'admin' | 'operator'>('operator');
    const { currentUser } = useUserStore();

    useEffect(() => {
        const unsub = subscribeToUsers(setMembers);
        return () => unsub();
    }, []);

    const handleSaveMember = async () => {
        if (!newName.trim()) return;

        const memberData: User = {
            id: editingMember ? editingMember.id : Date.now().toString(),
            name: newName,
            role: newRole,
            isActive: editingMember ? editingMember.isActive : true
        };

        await upsertUser(memberData);
        await auditLog({
            user: currentUser?.name || 'Sistema',
            action: editingMember ? 'Editou' : 'Criou',
            target: `Membro: ${memberData.name}`,
            details: `${editingMember ? 'Atualizou' : 'Adicionou'} ${memberData.name} como ${memberData.role}`,
            timestamp: Date.now()
        });
        closeModal();
    };

    const closeModal = () => {
        setIsAdding(false);
        setEditingMember(null);
        setNewName('');
        setNewRole('operator');
    };

    const openEditModal = (member: User) => {
        setEditingMember(member);
        setNewName(member.name);
        setNewRole(member.role);
        setIsAdding(true);
    };

    const handleDeleteMember = async (id: string) => {
        const member = members.find(m => m.id === id);
        if (window.confirm('Tem certeza que deseja remover este membro da equipe?')) {
            await deleteUser(id);
            await auditLog({
                user: currentUser?.name || 'Sistema',
                action: 'Deletou',
                target: `Membro: ${member?.name || id}`,
                details: `Membro removido da equipe`,
                timestamp: Date.now()
            });
        }
    };

    const handleToggleStatus = async (member: User) => {
        const newStatus = !member.isActive;
        await upsertUser({ ...member, isActive: newStatus });
        await auditLog({
            user: currentUser?.name || 'Sistema',
            action: 'Editou',
            target: `Membro: ${member.name}`,
            details: `Status alterado para ${newStatus ? 'Ativo' : 'Inativo'}`,
            timestamp: Date.now()
        });
    };

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-8 flex flex-col gap-6 max-w-6xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Gestão de Equipe</h2>
                    <p className="text-slate-500 text-sm mt-1">Gerencie os usuários e permissões do sistema</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md active:scale-95"
                >
                    <UserPlus size={18} />
                    Adicionar Membro
                </button>
            </div>

            {/* Filtros e Busca */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border-slate-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 italic">
                    <UserCheck size={16} />
                    Total: {members.length} membros
                </div>
            </div>

            {/* Modal de Adição/Edição */}
            {isAdding && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-primary-600 p-6 text-white text-center">
                            <h3 className="text-xl font-bold">{editingMember ? 'Editar Membro' : 'Novo Membro'}</h3>
                            <p className="text-primary-100 text-sm">Preencha os dados do funcionário</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full border-slate-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Ex: Pedro Alvares"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Função</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value as 'admin' | 'operator')}
                                    className="w-full border-slate-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="operator">Operador (Apenas Checklist)</option>
                                    <option value="admin">Administrador (Total)</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveMember}
                                    className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors shadow-lg"
                                >
                                    {editingMember ? 'Atualizar' : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabela de Membros */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Membro</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Função</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic">
                                        Nenhum membro encontrado com este nome.
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map(member => (
                                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${!member.isActive ? 'bg-slate-300' : 'bg-primary-500'}`}>
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className={`font-bold text-sm ${!member.isActive ? 'text-slate-400' : 'text-slate-900'}`}>{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {member.role === 'admin' ? (
                                                    <Shield size={14} className="text-amber-500" />
                                                ) : (
                                                    <UserIcon size={14} className="text-slate-400" />
                                                )}
                                                <span className={`text-xs font-semibold ${member.role === 'admin' ? 'text-amber-700' : 'text-slate-600'}`}>
                                                    {member.role === 'admin' ? 'Administrador' : 'Operador'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(member)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${member.isActive
                                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                    }`}
                                            >
                                                {member.isActive ? 'Ativo' : 'Inativo'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(member)}
                                                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMember(member.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

