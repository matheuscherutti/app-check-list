import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { Card } from '../types';

export const exportWorkspaceDataToCSV = async (workspaceId: string, month: string) => {
    try {
        // Obter todas as atividades do workspace atual
        let cards: Card[] = [];

        // Verifica se é o workspace base (escalas) que possui cards legados
        if (workspaceId === 'escalas') {
            const legacyQuery = query(collection(db, 'cards'));
            const legacySnapshot = await getDocs(legacyQuery);
            legacySnapshot.forEach(docSnap => {
                const data = docSnap.data();
                if (!data.workspaceId || data.workspaceId === 'escalas') {
                    cards.push({ ...data, id: docSnap.id, workspaceId: 'escalas' } as Card);
                }
            });
        } else {
            const cardsQuery = query(collection(db, 'cards'), where('workspaceId', '==', workspaceId));
            const cardsSnapshot = await getDocs(cardsQuery);
            cardsSnapshot.forEach(docSnap => {
                cards.push({ ...docSnap.data(), id: docSnap.id } as Card);
            });
        }

        if (cards.length === 0) {
            alert('Nenhum dado encontrado para backup neste workspace.');
            return;
        }

        // Busca dados mensais para determinar se a atividade está concluída NESTE mês
        const monthlyDocRef = doc(db, 'monthlyData', month);
        const monthlySnapshot = await getDoc(monthlyDocRef);
        const monthlyData = monthlySnapshot.exists() ? monthlySnapshot.data() : {};

        // Monta o CSV
        const headers = ['ID', 'Titulo', 'Categoria', 'Setor', 'Status Base', 'Status Mês', 'Subtarefas Concluidas'];
        let csvContent = headers.join(',') + '\n';

        cards.forEach(card => {
            const mData = monthlyData[card.id] || {};
            const monthStatus = mData.status || 'N/A';
            const baseStatus = card.status || 'Pendente';

            // Subtasks
            let totalSub = card.subTasks?.length || 0;
            let completedSub = 0;
            if (totalSub > 0) {
                card.subTasks?.forEach(sub => {
                    const subId = sub.id;
                    const mSubStatus = mData.subTasks?.[subId];
                    const subStatus = mSubStatus !== undefined ? mSubStatus : sub.status;
                    if (subStatus === 'Concluído') completedSub++;
                });
            }

            const cleanString = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

            const row = [
                cleanString(card.id),
                cleanString(card.title),
                cleanString(card.team || ''),
                cleanString(card.equipment || ''),
                cleanString(baseStatus),
                cleanString(monthStatus),
                totalSub > 0 ? `${completedSub}/${totalSub}` : '0/0'
            ];
            csvContent += row.join(',') + '\n';
        });

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `backup_workspace_${workspaceId}_${month}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('Backup concluído');
    } catch (error) {
        console.error('Erro ao exportar CSV:', error);
        alert('Falha ao exportar backup. Tente novamente.');
    }
};
