export interface Task {
    id?: number;
    title: string;
    description?: string;
    category?: string;
    completed: boolean;
    // Standardize field names and types to match backend/work-backend preference
    priority?: 'Low' | 'Medium' | 'High';
    attachments?: Attachment[];
    dueDate?: string;
    createdAt?: string;
    updatedAt?: string;
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
