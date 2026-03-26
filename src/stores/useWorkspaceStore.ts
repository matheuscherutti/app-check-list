import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workspace } from '../types';

interface WorkspaceState {
    activeWorkspaceId: string;
    workspaces: Workspace[];
    setWorkspaces: (workspaces: Workspace[]) => void;
    setActiveWorkspaceId: (id: string) => void;
    getActiveWorkspace: () => Workspace;
}

const DEFAULT_WORKSPACE: Workspace = { id: 'escalas', name: 'Check List - Escalas', isProtected: true };

export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set, get) => ({
            activeWorkspaceId: 'escalas',
            workspaces: [DEFAULT_WORKSPACE],
            setWorkspaces: (workspaces) => set({ workspaces }),
            setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
            getActiveWorkspace: () => {
                const { activeWorkspaceId, workspaces } = get();
                const current = workspaces.find(w => w.id === activeWorkspaceId);
                return current || workspaces[0] || DEFAULT_WORKSPACE;
            },
        }),
        {
            name: 'workspace-storage',
            partialize: (state) => ({ activeWorkspaceId: state.activeWorkspaceId }), // Only persist active ID
        }
    )
);
