export interface Task {
    id?: number;
    title: string;
    description?: string;
    category?: string;
    completed: boolean;
    createdAt?: string;
    updatedAt?: string;
    priority?: 'Low' | 'Medium' | 'High';
    attachments?: Attachment[];
    dueDate?: string;
}

export interface Attachment {
    id?: number;
    taskId: number;
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
    uploadedAt?: string;
}
