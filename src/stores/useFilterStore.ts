import { create } from 'zustand';
import type { EquipmentGroup } from '../types';

export type CardStatusFilter = 'Todos' | 'Pendentes' | 'Concluídos';
export type TeamFilter = 'Todos' | 'Pré Assigment' | 'Jeppesen' | 'CAE';
export type EquipmentFilterObj = EquipmentGroup | 'Todos';

interface FilterState {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: CardStatusFilter;
    setStatusFilter: (filter: CardStatusFilter) => void;
    teamFilter: TeamFilter;
    setTeamFilter: (filter: TeamFilter) => void;
    equipmentFilter: EquipmentFilterObj;
    setEquipmentFilter: (filter: EquipmentFilterObj) => void;
    selectedMonth: string;
    setSelectedMonth: (month: string) => void;
    resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
    statusFilter: 'Todos',
    setStatusFilter: (filter) => set({ statusFilter: filter }),
    teamFilter: 'Todos',
    setTeamFilter: (filter) => set({ teamFilter: filter }),
    equipmentFilter: 'Todos',
    setEquipmentFilter: (filter) => set({ equipmentFilter: filter }),
    selectedMonth: new Date().toISOString().slice(0, 7),
    setSelectedMonth: (month) => set({ selectedMonth: month }),
    resetFilters: () => set({ searchQuery: '', statusFilter: 'Todos', teamFilter: 'Todos', equipmentFilter: 'Todos' }),
}));
