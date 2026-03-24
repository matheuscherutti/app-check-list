import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workspace } from '../types';

export const WORKSPACES: Workspace[] = [
    { id: 'escalas', name: 'Check List - Escalas' },
    { id: 'payroll', name: 'Check List Payroll' },
    { id: 'diarias', name: 'Check List Diárias' },
    { id: 'treinamento', name: 'Check List Treinamento' }
];

interface WorkspaceState {
    activeWorkspaceId: string;
    setActiveWorkspaceId: (id: string) => void;
    getActiveWorkspace: () => Workspace;
}

export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set, get) => ({
            activeWorkspaceId: 'escalas',
            setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
            getActiveWorkspace: () => {
                const id = get().activeWorkspaceId;
                return WORKSPACES.find(w => w.id === id) || WORKSPACES[0];
            },
        }),
        { name: 'workspace-storage' }
    )
);
