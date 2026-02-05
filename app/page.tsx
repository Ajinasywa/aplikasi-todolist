"use client";

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import { Task } from '@/types';
import * as api from '@/services/api';
import { FiSearch, FiCloudOff, FiLoader } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

function HomeContent() {
  const { token } = useAuth();
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get filters from URL
  const filterParam = searchParams.get('filter') || 'all';
  const categoryParam = searchParams.get('category') || 'All';

  // Fetch tasks on component mount
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
    fetchTasks();
  }, [token]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      setError("Unable to connect to the server. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (title: string, description: string, category: string) => {
    try {
      const newTask = await api.createTask({
        title,
        description,
        category,
        completed: false
      });
      setTasks(prev => [newTask, ...prev]);
    } catch (err) {
      console.error("Failed to add task", err);
      alert("Failed to add task.");
    }
  };

  const handleToggleTask = async (id: number, completed: boolean) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
    try {
      await api.toggleTask(id, completed);
    } catch (err) {
      console.error("Failed to toggle task", err);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t));
    }
  };

  const handleDeleteTask = async (id: number) => {
    const oldTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await api.deleteTask(id);
    } catch (err) {
      console.error("Failed to delete task", err);
      setTasks(oldTasks);
      alert("Failed to delete task.");
    }
  };

  const handleUpdateTask = async (id: number, title: string, description?: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title, description } : t));
    try {
      await api.updateTask(id, { title, description });
    } catch (err) {
      console.error("Failed to update task", err);
      fetchTasks();
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // 1. Search Filter
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // 2. Status Filter (from URL)
      if (filterParam === 'active' && task.completed) return false;
      if (filterParam === 'completed' && !task.completed) return false;

      // 3. Category Filter (from URL)
      if (categoryParam !== 'All' && task.category !== categoryParam) return false;

      return true;
    });
  }, [tasks, filterParam, categoryParam, searchQuery]);

  const activeCount = tasks.filter(t => !t.completed).length;

  // Determine Page Title
  let pageTitle = "Dashboard";
  if (filterParam === 'active') pageTitle = "Active Tasks";
  if (filterParam === 'completed') pageTitle = "Completed Tasks";
  if (categoryParam !== 'All') pageTitle = `${categoryParam} Tasks`;

  return (
    <Layout>
      {/* Top Bar: Search and Mobile Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {pageTitle}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {activeCount} active tasks
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-xs group">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:shadow-md outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 font-medium"
          />
        </div>
      </div>

      <TaskForm onAdd={handleAddTask} />

      {/* Content */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FiLoader className="animate-spin mb-4" size={30} />
            <p>Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 p-6">
            <FiCloudOff size={40} className="mb-4" />
            <p className="font-medium text-center">{error}</p>
            <button
              onClick={fetchTasks}
              className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-lg text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
            onUpdate={handleUpdateTask}
            filter={filterParam === 'all' ? 'all' : filterParam === 'active' ? 'active' : 'completed'}
          />
        )}
      </div>
    </Layout>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <FiLoader className="animate-spin text-blue-500 mb-4" size={30} />
          <p className="text-gray-500">Loading application...</p>
        </div>
      </Layout>
    }>
      <ProtectedRoute>
        <HomeContent />
      </ProtectedRoute>
    </Suspense>
  );
}
