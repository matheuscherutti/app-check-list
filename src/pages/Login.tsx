import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import type { User } from '../stores/useUserStore';
import { subscribeToUsers } from '../lib/firestoreService';
import { Search, UserCircle } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { currentUser, setCurrentUser } = useUserStore();
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const unsub = subscribeToUsers((allUsers) => {
            // Only show active users on login screen
            setUsers(allUsers.filter(u => u.isActive));
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        // Se o usuário já estiver logado (localStorage tem valor), joga direto pro board.
        if (currentUser) {
            navigate('/board');
        }
    }, [currentUser, navigate]);

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        navigate('/board');
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
                <img
                    src="/logo.jpg"
                    alt="Logo Central de Controle"
                    className="w-48 h-auto mb-6 rounded-2xl shadow-xl border border-white/50"
                />
                <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                    Central de Controle
                </h2>
                <h3 className="text-center text-lg font-bold text-blue-600 uppercase tracking-widest mt-1">
                    Monitoramento Geral
                </h3>
                <p className="mt-4 text-center text-sm text-slate-600 font-medium bg-slate-100 px-4 py-1 rounded-full border border-slate-200">
                    Clique no seu nome para entrar
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
                    {/* Filtro de Busca */}
                    <div className="relative mb-6 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl leading-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        />
                    </div>

                    <ul className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto scrollbar-hide">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <li
                                    key={user.id}
                                    className="py-4 flex hover:bg-slate-50 cursor-pointer rounded-xl transition-all px-4 -mx-2 mb-1 group border border-transparent hover:border-slate-100 hover:shadow-sm"
                                    onClick={() => handleLogin(user)}
                                >
                                    <div className="p-2 bg-slate-100 text-slate-400 rounded-lg mr-4 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shrink-0">
                                        <UserCircle size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-lg font-bold text-slate-800 group-hover:text-blue-700 truncate transition-colors">
                                            {user.name}
                                        </p>
                                        <span className="text-xs font-black text-slate-300 uppercase tracking-widest leading-none group-hover:text-blue-300 transition-colors">
                                            {user.role === 'admin' ? 'Administrador' : 'Colaborador'}
                                        </span>
                                    </div>
                                    <div className="inline-flex items-center text-blue-500">
                                        <span className="opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all font-black text-xl">
                                            &rarr;
                                        </span>
                                    </div>
                                </li>
                            ))
                        ) : users.length > 0 ? (
                            <div className="text-center py-12">
                                <Search className="mx-auto h-12 w-12 text-slate-200 mb-3" />
                                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Ninguém com esse nome</p>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-2 text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline"
                                >
                                    Limpar busca
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-500 text-sm mb-6 font-medium">Nenhum administrador encontrado no banco de dados.</p>
                                <button
                                    onClick={() => handleLogin({ id: 'matheus', name: 'Matheus (Admin Local)', role: 'admin', isActive: true })}
                                    className="w-full inline-flex justify-center items-center px-6 py-4 border border-blue-100 text-sm font-black rounded-2xl text-blue-700 bg-blue-50 hover:bg-blue-100 hover:scale-[1.02] transition-all uppercase tracking-widest shadow-sm shadow-blue-500/5 group"
                                >
                                    <span className="mr-2 opacity-60 group-hover:rotate-12 transition-transform">🛠️</span>
                                    Acesso Desenvolvedor (Local)
                                </button>
                                <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-tight">Utilize este acesso apenas para configuração inicial</p>
                            </div>
                        )
                        }
                    </ul>
                </div>
            </div>
        </div>
    );
}
