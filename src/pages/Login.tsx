import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import type { User } from '../stores/useUserStore';
import { subscribeToUsers } from '../lib/firestoreService';

export default function Login() {
    const navigate = useNavigate();
    const { currentUser, setCurrentUser } = useUserStore();
    const [users, setUsers] = useState<User[]>([]);

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
                    Selecione seu nome para entrar. Não é necessária senha.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
                    <ul className="divide-y divide-slate-200">
                        {users.map((user) => (
                            <li
                                key={user.id}
                                className="py-4 flex hover:bg-slate-50 cursor-pointer rounded-md transition-colors px-4 -mx-4 group"
                                onClick={() => handleLogin(user)}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-medium text-slate-900 group-hover:text-primary-600 truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-sm text-slate-500 truncate">Entrar no sistema</p>
                                </div>
                                <div className="inline-flex items-center text-primary-500">
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        &rarr;
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
