import { create } from 'zustand';
import type { Card } from '../types';

interface ModalState {
    isOpen: boolean;
    editingCard?: Card;
    openNewCard: () => void;
    openEditCard: (card: Card) => void;
    closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
    isOpen: false,
    editingCard: undefined,
    openNewCard: () => set({ isOpen: true, editingCard: undefined }),
    openEditCard: (card) => set({ isOpen: true, editingCard: card }),
    closeModal: () => set({ isOpen: false, editingCard: undefined }),
}));
