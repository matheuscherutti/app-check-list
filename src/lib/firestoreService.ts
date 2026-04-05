import {
    collection,
    onSnapshot,
    query,
    doc,
    setDoc,
    deleteDoc,
    addDoc,
    where,
    orderBy,
    updateDoc
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { Card, Message, Workspace } from '../types';

export interface AuditEntry {
    id: string;
    user: string;
    action: 'Criou' | 'Editou' | 'Deletou' | 'Moveu' | 'Concluiu' | 'Reordenou';
    target: string; // Title or ID
    details: string;
    timestamp: number;
}

const CARDS_COLLECTION = 'cards';
const MESSAGES_COLLECTION = 'messages';
const MONTHLY_DATA_COLLECTION = 'monthlyData';
const USERS_COLLECTION = 'users';
const LOGS_COLLECTION = 'logs';
const WORKSPACES_COLLECTION = 'workspaces';

// --- WORKSPACES ---

export const subscribeToWorkspaces = (callback: (workspaces: Workspace[]) => void) => {
    const q = query(collection(db, WORKSPACES_COLLECTION), orderBy('order', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const workspaces = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Workspace));

        // Initial data logic: if 'escalas' is missing, it should be added manually or by a seeder.
        // For now, we return what's in the DB.
        callback(workspaces);
    });
};

export const upsertWorkspace = async (workspace: Workspace) => {
    const workspaceDoc = doc(db, WORKSPACES_COLLECTION, workspace.id);
    await setDoc(workspaceDoc, {
        ...workspace,
        updatedAt: Date.now(),
        isProtected: workspace.id === 'escalas' // Hard protection for 'escalas'
    }, { merge: true });
};

export const deleteWorkspace = async (workspaceId: string) => {
    if (workspaceId === 'escalas') return; // Protective guard
    await deleteDoc(doc(db, WORKSPACES_COLLECTION, workspaceId));
};

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
        where('workspaceId', '==', workspaceId)
    );
    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Message))
            .filter(msg => msg.month === month);
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

    // Prepare dot notation updates for updateDoc
    const dotUpdates: any = {};
    Object.keys(updates).forEach(key => {
        dotUpdates[`${cardId}.${key}`] = updates[key];
    });

    try {
        // Try updateDoc first (handles nested updates efficiently)
        await updateDoc(docRef, dotUpdates);
    } catch (e: any) {
        // If document doesn't exist, create it with setDoc using NESTED object structure
        if (e.code === 'not-found') {
            await setDoc(docRef, { [cardId]: updates }, { merge: true });
        } else {
            console.error("Error updating monthly data:", e);
            // Fallback for any other error: use setDoc with proper nested structure
            await setDoc(docRef, { [cardId]: updates }, { merge: true });
        }
    }
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
