import axios from 'axios';
import { Task } from '@/types';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getTasks = async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data;
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    const response = await api.post('/tasks', {
        ...task,
        category: task.category || 'Personal',
        priority: task.priority || 'medium',
        attachments: task.attachments || [],
        dueDate: task.dueDate
    });
    return response.data;
};

export const updateTask = async (id: string, task: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
};

export const toggleTask = async (id: string, completed: boolean): Promise<Task> => {
    return updateTask(id, { completed });
};

export default api;
