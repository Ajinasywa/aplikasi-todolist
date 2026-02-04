"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import { Task } from '@/types';
import * as api from '@/services/api';
import { FiSearch, FiCloudOff, FiLoader } from 'react-icons/fi';
import clsx from 'clsx';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasks();
      // Ensure we have an array (in case API returns wrapper)
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      // Fallback data for demo if API is not running, or just show error.
      // For this task, user specified http://localhost:8080/api.
      // I'll show a friendly error message.
      setError("Unable to connect to the server. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (title: string, description: string) => {
    // Optimistic update? Or wait for server?
    // Let's wait for server for ID generation consistency, but we could handle optimistic.
    // Given the requirements, standard flow is fine.
    try {
      const newTask = await api.createTask({
        title,
        description,
        completed: false
      });
      setTasks(prev => [newTask, ...prev]);
    } catch (err) {
      console.error("Failed to add task", err);
      alert("Failed to add task.");
    }
  };

  const handleToggleTask = async (id: number, completed: boolean) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
    try {
      await api.toggleTask(id, completed);
      // Re-update if needed, or rely on optimistic.
    } catch (err) {
      console.error("Failed to toggle task", err);
      // Revert
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t));
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!id) return;
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
    // Optimistic
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title, description } : t));
    try {
      await api.updateTask(id, { title, description });
    } catch (err) {
      console.error("Failed to update task", err);
      // Revert involves fetching or knowing previous state. 
      // For simplicity, we might just alert or refetch. 
      // Given the optimism, simpler to just refetch or let it be (edge case).
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

      // 2. Status Filter
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    });
  }, [tasks, filter, searchQuery]);

  const activeCount = tasks.filter(t => !t.completed).length;

  return (
    <Layout>
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

      {/* Controls: Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 sticky top-4 z-10 bg-gray-50/95 dark:bg-gray-950/95 p-2 rounded-xl backdrop-blur-sm transition-all">

        {/* Search */}
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
        ) : (
          <TaskList
            tasks={filteredTasks}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
            onUpdate={handleUpdateTask}
            filter={filter}
          />
        )}
      </div>
    </Layout>
  );
}
