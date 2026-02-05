import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import clsx from 'clsx';

interface TaskFormProps {
    onAdd: (title: string, description: string, category: string) => Promise<void>;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Personal');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const categories = ['Personal', 'Work', 'Study', 'Shopping', 'Others'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsLoading(true);
        try {
            await onAdd(title, description, category);
            setTitle('');
            setDescription('');
            setCategory('Personal');
            setIsExpanded(false);
        } catch (error) {
            console.error("Failed to add task", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mb-8">
            {!isExpanded ? (
                <motion.button
                    layoutId="task-form-container"
                    onClick={() => setIsExpanded(true)}
                    className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3 text-gray-500 dark:text-gray-400 transition-all group"
                >
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                        <FiPlus size={20} />
                    </div>
                    <span className="font-medium">Add a new task...</span>
                </motion.button>
            ) : (
                <motion.form
                    layoutId="task-form-container"
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 overflow-hidden"
                >
                    <div className="space-y-4">
                        <div>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Task title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-lg font-semibold placeholder:text-gray-400 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 p-0 focus:ring-0"
                            />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                        >
                            <textarea
                                placeholder="Description (optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                className="w-full resize-none text-gray-600 dark:text-gray-300 placeholder:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                            />

                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-500 dark:text-gray-400">Category:</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </motion.div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsExpanded(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!title.trim() || isLoading}
                                className={clsx(
                                    "px-6 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-sm",
                                    !title.trim() || isLoading
                                        ? "bg-blue-300 dark:bg-blue-800 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 hover:shadow-md active:transform active:scale-95"
                                )}
                            >
                                {isLoading ? 'Adding...' : 'Add Task'}
                            </button>
                        </div>
                    </div>
                </motion.form>
            )}
        </div>
    );
};

export default TaskForm;
