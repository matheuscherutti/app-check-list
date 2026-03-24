export type Status = 'Pendente' | 'Concluído';
export type EquipmentGroup = 'A320' | 'A330' | 'ATR' | 'ERJ' | 'Cmros';
export type Team = 'Pré Assigment' | 'Jeppesen' | 'CAE';

export interface SubTask {
    id: string;
    title: string;
    status: Status;
}

export interface Workspace {
    id: string;
    name: string;
    icon?: string;
}

export interface Card {
    id: string; // Used across months to identify the same logical card
    workspaceId: string; // Linked to a specific workspace
    title: string;
    equipment: EquipmentGroup;
    team: Team;
    status: Status;
    order: number;
    isMultiTask?: boolean;
    subTasks?: SubTask[];
    notes?: string;
    activeFrom: string; // Format: yyyy-MM
    activeUntil?: string | null; // Format: yyyy-MM
    startMonth?: string; // Legacy
    endMonth?: string; // Legacy
    createdAt: number | Date;
}

export interface Comment {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    createdAt: number | Date;
}

export interface Message {
    id: string;
    workspaceId: string;
    text: string;
    userName: string;
    month: string;
    createdAt: number;
}

export interface AuditLog {
    id: string;
    user: string;
    action: 'CREATE' | 'EDIT_TITLE' | 'EDIT_STATUS' | 'DELETE' | 'MOVE';
    context: {
        targetMonth: string;
        equipment: string;
        team: string;
        workspaceId?: string;
    };
    message: string;
    createdAt: number | Date;
}
