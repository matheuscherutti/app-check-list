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
import type { Card, Message } from '../types';

export interface AuditEntry {
    id: string;
    user: string;
    action: 'Criou' | 'Editou' | 'Deletou' | 'Moveu' | 'Concluiu';
    target: string; // Title or ID
    details: string;
    timestamp: number;
}

const CARDS_COLLECTION = 'cards';
const MESSAGES_COLLECTION = 'messages';
const MONTHLY_DATA_COLLECTION = 'monthlyData';
const USERS_COLLECTION = 'users';
const LOGS_COLLECTION = 'logs';

// --- CARDS ---

export const subscribeToCards = (workspaceId: string, callback: (cards: Card[]) => void) => {
    // Queries all cards. We'll filter by workspaceId. 
    // For legacy cards, we'll assume 'escalas' if missing.
    const q = query(collection(db, CARDS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
        const cards = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                workspaceId: data.workspaceId || 'escalas' // Migration logic
            } as Card;
        });
        const filteredCards = cards.filter(c => c.workspaceId === workspaceId);
        callback(filteredCards);
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

export const subscribeToMessages = (workspaceId: string, month: string, callback: (messages: Message[]) => void) => {
    const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('month', '==', month),
        where('workspaceId', '==', workspaceId),
        orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Message));
        callback(messages);
    });
};

export const addMessage = async (workspaceId: string, text: string, userName: string, month: string) => {
    await addDoc(collection(db, MESSAGES_COLLECTION), {
        workspaceId,
        text,
        userName,
        month,
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

    // Use dot notation to update specific fields within the card object to avoid overwriting the whole object
    const finalUpdates: any = {};
    Object.keys(updates).forEach(key => {
        finalUpdates[`${cardId}.${key}`] = updates[key];
    });

    await setDoc(docRef, finalUpdates, { merge: true });
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

// --- AUDIT LOGS ---

export const auditLog = async (entry: Omit<AuditEntry, 'id'>) => {
    await addDoc(collection(db, LOGS_COLLECTION), {
        ...entry,
        timestamp: Date.now()
    });
};

export const subscribeToLogs = (callback: (logs: AuditEntry[]) => void) => {
    const q = query(collection(db, LOGS_COLLECTION), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AuditEntry));
        callback(logs);
    });
};
