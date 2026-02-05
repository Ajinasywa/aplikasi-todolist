import axios from 'axios';
import { Task } from '@/types';

// Use local IP for better network support across devices
const API_URL = 'http://192.168.1.21:8080/api';

// Base API instance without auth
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API instance with auth interceptor
const apiWithAuth = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
apiWithAuth.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle auth responses
apiWithAuth.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Note: We can't redirect here in a service, so we'll let the component handle it
        }
        return Promise.reject(error);
    }
);

// Auth functions
export const registerUser = async (userData: { username: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const loginUser = async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    const { token } = response.data;
    localStorage.setItem('token', token); // Store token in localStorage
    return response.data;
};

export const logoutUser = () => {
    localStorage.removeItem('token');
};

export const getTasks = async (): Promise<Task[]> => {
    const response = await apiWithAuth.get('/todos');
    // Map backend response to frontend Task interface
    const todos = response.data.todos || [];
    return todos.map((todo: any) => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        category: todo.category || 'Personal', // Default to Personal
        completed: todo.is_done,
        createdAt: todo.created_at,
        updatedAt: todo.updated_at,
    }));
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    const response = await apiWithAuth.post('/todos', {
        title: task.title,
        description: task.description,
        category: task.category,
    });
    // Map backend response to frontend Task interface
    const todo = response.data;
    return {
        id: todo.id,
        title: todo.title,
        description: todo.description,
        completed: todo.is_done,
        createdAt: todo.created_at,
        updatedAt: todo.updated_at,
    };
};

export const updateTask = async (id: number, task: Partial<Task>): Promise<Task> => {
    const response = await apiWithAuth.put(`/todos/${id}`, {
        title: task.title,
        description: task.description,
        category: task.category,
        is_done: task.completed,
    });
    // Map backend response to frontend Task interface
    const todo = response.data;
    return {
        id: todo.id,
        title: todo.title,
        description: todo.description,
        completed: todo.is_done,
        createdAt: todo.created_at,
        updatedAt: todo.updated_at,
    };
};

export const deleteTask = async (id: number): Promise<void> => {
    await apiWithAuth.delete(`/todos/${id}`);
};

export const toggleTask = async (id: number, completed: boolean): Promise<Task> => {
    return updateTask(id, { completed });
};

export default api;
