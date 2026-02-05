export interface Task {
    id?: string;
    title: string;
    description?: string;
    category?: string;
    completed: boolean;
    priority?: 'low' | 'medium' | 'high';
    attachments?: { url: string; name: string; type: string }[];
    dueDate?: string;
    createdAt?: string;
    updatedAt?: string;
}
