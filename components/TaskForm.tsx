import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import clsx from 'clsx';

interface TaskFormProps {
    onAdd: (title: string, description: string, category: string, priority: 'Low' | 'Medium' | 'High', attachments: { url: string; name: string; type: string }[], dueDate: string) => Promise<void>;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Personal');
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [dueDate, setDueDate] = useState('');
    const [attachments, setAttachments] = useState<{ url: string; name: string; type: string }[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const categories = ['Personal', 'Work', 'Study', 'Shopping', 'Others'];
    const priorities = ['Low', 'Medium', 'High'] as const;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Simulate upload by creating a local URL
            const url = URL.createObjectURL(file);
            setAttachments(prev => [...prev, { url, name: file.name, type: file.type }]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsLoading(true);
        try {
            await onAdd(title, description, category, priority, attachments, dueDate);
            setTitle('');
            setDescription('');
            setCategory('Personal');
            setPriority('Medium');
            setDueDate('');
            setAttachments([]);
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

                            <div className="flex flex-col gap-3">
                                <div>
                                    <span className="text-xs text-gray-500 font-medium mb-1.5 block">Category</span>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setCategory(cat)}
                                                className={clsx(
                                                    "px-3 py-1.5 text-xs font-medium rounded-full transition-colors border",
                                                    category === cat
                                                        ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                                                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700"
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs text-gray-500 font-medium mb-1.5 block">Priority</span>
                                    <div className="flex gap-2">
                                        {priorities.map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPriority(p)}
                                                className={clsx(
                                                    "px-3 py-1.5 text-xs font-medium rounded-full transition-colors border capitalize",
                                                    priority === p && p === 'High' && "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
                                                    priority === p && p === 'Medium' && "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
                                                    priority === p && p === 'Low' && "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
                                                    priority !== p && "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700"
                                                )}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="min-w-[120px]">
                                    <span className="text-xs text-gray-500 font-medium mb-1.5 block">Due Date</span>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full text-xs font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-sm text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                                        Attach files
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>

                                {attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {attachments.map((file, index) => (
                                            <div key={index} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                                                {file.type.startsWith('image/') ? (
                                                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs text-center p-1 text-gray-500">{file.name.slice(0, 8)}...</span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttachment(index)}
                                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
