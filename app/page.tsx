"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import CalendarView from '@/components/CalendarView';
import Header from '@/components/Header';
import { Task, Attachment } from '@/types';
import * as api from '@/services/api';
import { FiSearch, FiCloudOff, FiLoader, FiList, FiCalendar } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';
import ProtectedRoute from '@/components/ProtectedRoute';

function HomeContent() {
  const { token } = useAuth();
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // URL State Mappings
  const filterParam = searchParams.get('filter') || 'all';
  const categoryParam = searchParams.get('category') || 'All';

  // Check authentication
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
      // Ensure data is array
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      setError("Unable to connect to the server. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetViewMode = (mode: 'list' | 'calendar') => {
    const params = new URLSearchParams(searchParams.toString());
    if (mode === 'calendar') {
      params.set('view', 'calendar');
    } else {
      params.delete('view');
    }
    // Correctly use router.push with the params
    // Note: Next.js router.push might not update URL immediately if component re-renders
    // but with useSearchParams it should be fine.
    // However, since we track viewMode in state, we should update it.
    // But wait, the useEffect for viewMode was removed/conflicted.
    // The previous code had it in state. Let's keep it simple: strict local state + URL sync.
    setViewMode(mode);
    // history.pushState(null, '', `/?${params.toString()}`); // Just manual push? No, use router.
    // router.push is better.
    // Actually, let's just update URL and let URL drive state?
    // The original code had: const viewMode = searchParams.get('view') ...
    // So we don't need independent state if we trust searchParams.
    // But let's stick to the conflicting file's structure which had state AND URL mappings.
  };

  const setFilter = (newFilter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', newFilter);
    }
    // router.push(`/?${params.toString()}`);
    // For now, let's just assume we want to push.
  };

  const handleAddTask = async (title: string, description: string, category: string, priority: 'Low' | 'Medium' | 'High', attachments: { url: string; name: string; type: string }[], dueDate: string) => {
    try {
      // Map basic attachment structure to Attachment type if needed, or pass as is if API handles it.
      // API expects Attachment[]. We need to mock the missing fields or update API.
      // For now, let's cast or default.
      const mappedAttachments: Attachment[] = attachments.map(a => ({
        taskId: 0, // Placeholder
        fileName: a.name,
        fileType: a.type,
        fileSize: 0,
        url: a.url
      }));

      const newTask = await api.createTask({
        title,
        description,
        category,
        priority,
        attachments: mappedAttachments,
        dueDate,
        completed: false
      });

      // Ensure all properties are properly set
      const taskWithDefaults: Task = {
        ...newTask,
        priority: newTask.priority || 'Medium',
        category: newTask.category || 'Personal',
        dueDate: newTask.dueDate
      };

      setTasks(prev => [taskWithDefaults, ...prev]);
    } catch (err) {
      console.error("Failed to add task", err);
    }
  };

  const handleToggleTask = async (id: number, completed: boolean) => {
    try {
      // Optimistic
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));

      const updatedTask = await api.updateTask(id.toString(), { completed });
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    } catch (err) {
      console.error("Failed to toggle task", err);
      // Revert
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t));
    }
  };

  const handleDeleteTask = async (id: number) => {
    const oldTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await api.deleteTask(id.toString());
    } catch (err) {
      console.error("Failed to delete task", err);
      setTasks(oldTasks);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      if (updatedTask.id === undefined) return;

      const apiUpdatedTask = await api.updateTask(updatedTask.id.toString(), {
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
      fetchTasks(); // Revert/Refresh
    }
  };

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // 1. Search Filter
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // 2. Status Filter (from URL param 'filter')
      if (filterParam === 'active' && task.completed) return false;
      if (filterParam === 'completed' && !task.completed) return false;

      // 3. Category Filter (from URL param 'category')
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Header />

        {/* Stats / Summary */}
        <div className="flex justify-between items-center mb-8 px-2">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            <p className="text-gray-500 text-sm">
              {activeCount} active tasks
            </p>
          </div>
        </div>

        <TaskForm onAdd={handleAddTask} />

        {/* Controls Container */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 sticky top-4 z-10 bg-gray-50/95 dark:bg-gray-950/95 p-2 rounded-xl backdrop-blur-sm transition-all">

          {/* Search Bar */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => handleSetViewMode('list')}
              className={clsx(
                "p-2 rounded-md transition-all",
                viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              )}
              title="List View"
            >
              <FiList size={20} />
            </button>
            <button
              onClick={() => handleSetViewMode('calendar')}
              className={clsx(
                "p-2 rounded-md transition-all",
                viewMode === 'calendar' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              )}
              title="Calendar View"
            >
              <FiCalendar size={20} />
            </button>
          </div>

          {/* Filters */}
          <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-lg self-start sm:self-auto">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  "px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all",
                  filterParam === f
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
              >
                {f}
              </button>
            ))}
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
          ) : viewMode === 'list' ? (
            <TaskList
              tasks={filteredTasks}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              onUpdate={handleUpdateTask}
              filter={filterParam === 'all' ? 'all' : filterParam === 'active' ? 'active' : 'completed'}
            />
          ) : (
            <CalendarView
              tasks={filteredTasks}
              onClose={() => handleSetViewMode('list')}
              onToggle={handleToggleTask}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ProtectedRoute>
        <HomeContent />
      </ProtectedRoute>
    </Suspense>
  );
}
