export interface Task {
    id?: number;
    title: string;
    description?: string;
    category?: string;
    completed: boolean;
    createdAt?: string;
    updatedAt?: string;
}
