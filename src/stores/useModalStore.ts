import { create } from 'zustand';
import type { Card } from '../types';

interface ModalState {
    isOpen: boolean;
    editingCard?: Card | Partial<Card>;
    openNewCard: (initialData?: Partial<Card>) => void;
    openEditCard: (card: Card) => void;
    closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
    isOpen: false,
    editingCard: undefined,
    openNewCard: (initialData) => set({ isOpen: true, editingCard: initialData }),
    openEditCard: (card) => set({ isOpen: true, editingCard: card }),
    closeModal: () => set({ isOpen: false, editingCard: undefined }),
}));
