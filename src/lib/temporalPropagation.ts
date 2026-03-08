import { writeBatch, doc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { getAvailableMonths } from '../utils/dateHelper';
import type { Card } from '../types';

type ActionType = 'CREATE' | 'UPDATE_CONTENT' | 'MOVE' | 'DELETE';

export async function propagateTemporalChanges(
    action: ActionType,
    targetMonth: string,
    cardId: string,
    cardData: Partial<Card>,
    currentUserName: string
) {
    const allAvailableMonths = getAvailableMonths();
    const affectedMonths = allAvailableMonths.filter((m) => m >= targetMonth);

    const batch = writeBatch(db);

    for (const month of affectedMonths) {
        const cardRef = doc(db, `checklists/${month}/cards/${cardId}`);

        if (action === 'CREATE') {
            batch.set(cardRef, {
                ...cardData,
                status: 'Pendente',
                createdAt: serverTimestamp(),
            });
        } else if (action === 'UPDATE_CONTENT' || action === 'MOVE') {
            batch.update(cardRef, {
                ...(cardData.title && { title: cardData.title }),
                ...(cardData.order !== undefined && { order: cardData.order }),
                ...(cardData.equipment && { equipment: cardData.equipment }),
                ...(cardData.team && { team: cardData.team }),
            });
        } else if (action === 'DELETE') {
            batch.delete(cardRef);
        }
    }

    // Create audit log
    let message = '';
    switch (action) {
        case 'CREATE': message = `Criou o card "${cardData.title}"`; break;
        case 'UPDATE_CONTENT': message = `Editou o título do card para "${cardData.title}"`; break;
        case 'MOVE': message = `Moveu o card "${cardData.title || cardId}" de ordem ou grupo`; break;
        case 'DELETE': message = `Excluiu o card "${cardData.title || cardId}"`; break;
    }

    const logRef = doc(collection(db, 'audit_logs'));
    batch.set(logRef, {
        user: currentUserName,
        action: action,
        context: {
            targetMonth,
            equipment: cardData.equipment || 'Unknown',
            team: cardData.team || 'Unknown',
        },
        message,
        createdAt: serverTimestamp(),
    });

    await batch.commit();
}

export async function updateCardStatus(
    month: string,
    cardId: string,
    newStatus: 'Pendente' | 'Concluído',
    cardTitle: string,
    currentUserName: string,
    equipment: string,
    team: string
) {
    // Status update is ONLY for the current month.
    const batch = writeBatch(db);
    const cardRef = doc(db, `checklists/${month}/cards/${cardId}`);

    batch.update(cardRef, { status: newStatus });

    // Add audit log
    const logRef = doc(collection(db, 'audit_logs'));
    batch.set(logRef, {
        user: currentUserName,
        action: 'EDIT_STATUS',
        context: {
            targetMonth: month,
            equipment,
            team,
        },
        message: `Marcou o card "${cardTitle}" como ${newStatus}`,
        createdAt: serverTimestamp(),
    });

    await batch.commit();
}
