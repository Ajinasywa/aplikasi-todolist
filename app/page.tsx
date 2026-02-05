"use client";

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import CalendarView from '@/components/CalendarView';
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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

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

  const handleAddTask = async (title: string, description: string, category: string, priority: 'Low' | 'Medium' | 'High', dueDate?: string) => {
    try {
      const newTask = await api.createTask({
        title,
        description,
        category,
        priority,
        dueDate,
        completed: false
      });

      // Ensure all properties are properly set
      const taskWithDefaults = {
        ...newTask,
        priority: newTask.priority || 'Medium',
        category: newTask.category || 'Personal',
        dueDate: newTask.dueDate
      };

      setTasks(prev => [taskWithDefaults, ...prev]);
    } catch (err) {
      console.error("Failed to add task", err);
      alert("Failed to add task.");
    }
  };

  const handleToggleTask = async (id: number, completed: boolean) => {
    try {
      const updatedTask = await api.updateTask(id, { completed });
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
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

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      const apiUpdatedTask = await api.updateTask(updatedTask.id!, {
        title: updatedTask.title,
        description: updatedTask.description,
        category: updatedTask.category,
        priority: updatedTask.priority,
        dueDate: updatedTask.dueDate,
        completed: updatedTask.completed
      });
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? apiUpdatedTask : t));
    } catch (err) {
      console.error("Failed to update task", err);
      fetchTasks();
    }
  };

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
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

    // Sort by priority: High > Medium > Low, then by creation date
    filtered.sort((a, b) => {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      const priorityA = priorityOrder[a.priority || 'Medium'];
      const priorityB = priorityOrder[b.priority || 'Medium'];

      if (priorityA !== priorityB) {
        return priorityB - priorityA; // Higher priority first
      }

      // If priority is the same, sort by creation date (newest first)
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return filtered;
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

      {/* View Toggle */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${viewMode === 'list'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${viewMode === 'calendar'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            Calendar View
          </button>
        </div>
      </div>

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
        ) : viewMode === 'calendar' ? (
          <CalendarView
            tasks={filteredTasks}
            onClose={() => setViewMode('list')}
            onToggle={handleToggleTask}
          />
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
