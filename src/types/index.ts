export type Status = 'Pendente' | 'Concluído';
export type EquipmentGroup = 'A320' | 'A330' | 'ATR' | 'ERJ' | 'Cmros';
export type Team = 'Pré Assigment' | 'Jeppesen' | 'CAE';

export interface SubTask {
    id: string;
    title: string;
    status: Status;
}

export interface Card {
    id: string; // Used across months to identify the same logical card
    title: string;
    equipment: EquipmentGroup;
    team: Team;
    status: Status;
    order: number;
    isMultiTask?: boolean;
    subTasks?: SubTask[];
    notes?: string;
    startMonth?: string; // Format: yyyy-MM
    endMonth?: string; // Format: yyyy-MM
    createdAt: number | Date;
}

export interface Comment {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    createdAt: number | Date;
}

export interface AuditLog {
    id: string;
    user: string;
    action: 'CREATE' | 'EDIT_TITLE' | 'EDIT_STATUS' | 'DELETE' | 'MOVE';
    context: {
        targetMonth: string;
        equipment: string;
        team: string;
    };
    message: string;
    createdAt: number | Date;
}
