import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import type { User } from '../stores/useUserStore';

// Mock values for now, this would normally come from Firebase `users` collection.
const MOCK_USERS: User[] = [
    { id: '1', name: 'João Silva', role: 'admin', isActive: true },
    { id: '2', name: 'Maria Souza', role: 'operator', isActive: true },
    { id: '3', name: 'Carlos Almeida', role: 'operator', isActive: true },
];

export default function Login() {
    const navigate = useNavigate();
    const { currentUser, setCurrentUser } = useUserStore();
    const [users] = useState<User[]>(MOCK_USERS); // Later, replace with Firestore listener!

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
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Check List Aeronautas
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
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
