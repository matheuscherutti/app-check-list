import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    name: string;
    role: 'admin' | 'operator';
    isActive: boolean;
}

interface UserState {
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            currentUser: null,
            setCurrentUser: (user) => set({ currentUser: user }),
            logout: () => set({ currentUser: null }),
        }),
        {
            name: 'checklist-app-user-storage',
        }
    )
);
