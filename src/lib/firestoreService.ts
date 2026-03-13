import {
    collection,
    onSnapshot,
    query,
    doc,
    setDoc,
    deleteDoc,
    addDoc,
    where,
    orderBy
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { Card } from '../types';

// Types duplicated here for safety or imported from types
export interface Message {
    id: string;
    text: string;
    userName: string;
    month: string;
    createdAt: number;
}

const CARDS_COLLECTION = 'cards';
const MESSAGES_COLLECTION = 'messages';
const MONTHLY_DATA_COLLECTION = 'monthlyData';
const USERS_COLLECTION = 'users';

// --- CARDS ---

export const subscribeToCards = (callback: (cards: Card[]) => void) => {
    const q = query(collection(db, CARDS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
        const cards = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Card));
        callback(cards);
    });
};

export const upsertCard = async (card: Card) => {
    const cardDoc = doc(db, CARDS_COLLECTION, card.id);
    await setDoc(cardDoc, { ...card, updatedAt: Date.now() }, { merge: true });
};

export const deleteCard = async (cardId: string) => {
    await deleteDoc(doc(db, CARDS_COLLECTION, cardId));
};

// --- MESSAGES ---

export const subscribeToMessages = (month: string, callback: (messages: Message[]) => void) => {
    const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('month', '==', month),
        orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Message));
        callback(messages);
    });
};

export const addMessage = async (message: Omit<Message, 'id'>) => {
    await addDoc(collection(db, MESSAGES_COLLECTION), {
        ...message,
        createdAt: Date.now()
    });
};

export const deleteMessage = async (messageId: string) => {
    await deleteDoc(doc(db, MESSAGES_COLLECTION, messageId));
};

// --- MONTHLY DATA (Status/Notes per month per card) ---

export const subscribeToMonthlyData = (callback: (data: any) => void) => {
    const q = query(collection(db, MONTHLY_DATA_COLLECTION));
    return onSnapshot(q, (snapshot) => {
        const data: Record<string, any> = {};
        snapshot.docs.forEach(doc => {
            data[doc.id] = doc.data();
        });
        callback(data);
    });
};

export const updateMonthlyCardData = async (month: string, cardId: string, updates: any) => {
    const docRef = doc(db, MONTHLY_DATA_COLLECTION, month);
    await setDoc(docRef, { [cardId]: updates }, { merge: true });
};

// --- USERS (Equipe) ---

export const subscribeToUsers = (callback: (users: any[]) => void) => {
    const q = query(collection(db, USERS_COLLECTION), orderBy('name', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        callback(users);
    });
};

export const upsertUser = async (user: any) => {
    const userDoc = doc(db, USERS_COLLECTION, user.id);
    await setDoc(userDoc, { ...user, updatedAt: Date.now() }, { merge: true });
};

export const deleteUser = async (userId: string) => {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
};
