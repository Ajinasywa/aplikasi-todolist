"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import CalendarView from '@/components/CalendarView';
import { Task } from '@/types';
import * as api from '@/services/api';
import { FiSearch, FiCloudOff, FiLoader, FiList, FiCalendar } from 'react-icons/fi';
import clsx from 'clsx';

import { useSearchParams, useRouter } from 'next/navigation';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const initialView = searchParams.get('view') === 'calendar' ? 'calendar' : 'list';
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>(initialView);

  // Sync state when URL changes
  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'calendar') {
      setViewMode('calendar');
    } else {
      setViewMode('list');
    }
  }, [searchParams]);

  const handleSetViewMode = (mode: 'list' | 'calendar') => {
    setViewMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    if (mode === 'calendar') {
      params.set('view', 'calendar');
    } else {
      params.delete('view');
    }
    router.push(`/?${params.toString()}`);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks. Please ensure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (title: string, description: string, category: string, priority: 'low' | 'medium' | 'high', attachments: { url: string; name: string; type: string }[], dueDate: string) => {
    // Optimistic update? Or wait for server?
    // Let's wait for server for ID generation consistency, but we could handle optimistic.
    // Given the requirements, standard flow is fine.
    try {
      const newTask = await api.createTask({
        title,
        description,
        completed: false,
        category,
        priority,
        attachments,
        dueDate
      });
      setTasks(prev => [newTask, ...prev]);
    } catch (err) {
      console.error("Failed to add task", err);
      // Optional: show error toast
    }
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
      await api.updateTask(id, { completed });
    } catch (err) {
      console.error("Failed to toggle task", err);
      // Revert optimism if needed
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!id) return;
    try {
      setTasks(prev => prev.filter(t => t.id !== id));
      await api.deleteTask(id);
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      await api.updateTask(id, updates);
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesFilter =
        filter === 'all' ? true :
          filter === 'active' ? !task.completed :
            task.completed;

      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const categoryParam = searchParams.get('category');
      const matchesCategory = categoryParam ? task.category === categoryParam : true;

      return matchesFilter && matchesSearch && matchesCategory;
    });
  }, [tasks, filter, searchQuery, searchParams]);

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
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              title="List View"
            >
              <FiList size={20} />
            </button>
            <button
              onClick={() => handleSetViewMode('calendar')}
              className={`p-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
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
                  filter === f
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
              filter={filter}
            />
          ) : (
            <CalendarView tasks={filteredTasks} />
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <HomeContent />
    </Suspense>
  );
}
