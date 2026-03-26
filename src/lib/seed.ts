import { db } from './firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const USERS_COLLECTION = 'users';

const MOCK_USERS = [
    { id: 'admin', name: 'Administrador Local', isActive: true, role: 'ADMIN' },
];

export const seedMockUsers = async () => {
    for (const user of MOCK_USERS) {
        const userDoc = doc(db, USERS_COLLECTION, user.id);
        await setDoc(userDoc, { ...user, updatedAt: Date.now() }, { merge: true });
    }
    console.log('Mock users seeded!');
};
