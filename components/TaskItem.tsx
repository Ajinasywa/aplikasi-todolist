import React, { useState } from 'react';
import { Task } from '@/types';
import { motion } from 'framer-motion';
import { FiTrash2, FiEdit2, FiX, FiCheck, FiFile } from 'react-icons/fi';
import clsx from 'clsx';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string, completed: boolean) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Task>) => Promise<void>;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description || '');
    const [isUpdating, setIsUpdating] = useState(false);

    // Sync state with props when task updates or edit mode opens/closes
    React.useEffect(() => {
        setEditTitle(task.title);
        setEditDescription(task.description || '');
    }, [task, isEditing]);

    const handleUpdate = async () => {
        if (!editTitle.trim()) return;
        setIsUpdating(true);
        try {
            await onUpdate(task.id!, { title: editTitle, description: editDescription });
            setIsEditing(false);
        } catch (err) {
            console.error("Update failed", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            onDelete(task.id!);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={clsx(
                "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 transition-all hover:shadow-md",
                task.completed && "opacity-75"
            )}
        >
            <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                    onClick={() => onToggle(task.id!, !task.completed)}
                    className={clsx(
                        "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                        task.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"
                    )}
                >
                    {task.completed && <FiCheck size={14} />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                autoFocus
                            />
                            <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                rows={3}
                                placeholder="Add a description..."
                                className="w-full text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    <FiX size={18} />
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={!editTitle.trim() || isUpdating}
                                    className="p-2 text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg"
                                >
                                    <FiCheck size={18} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={`transition-all ${task.completed ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-2">
                                <h3 className={clsx(
                                    "text-lg font-medium text-gray-900 dark:text-gray-100 leading-snug break-words",
                                    task.completed && "line-through text-gray-500"
                                )}>
                                    {task.title}
                                </h3>
                                {task.priority && (
                                    <span className={clsx(
                                        "px-2 py-0.5 text-[10px] font-medium rounded-full border capitalize",
                                        task.priority === 'high' && "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30",
                                        task.priority === 'medium' && "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30",
                                        task.priority === 'low' && "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30"
                                    )}>
                                        {task.priority}
                                    </span>
                                )}
                                {task.category && (
                                    <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700">
                                        {task.category}
                                    </span>
                                )}
                            </div>
                            {task.description ? (
                                <p className={clsx(
                                    "mt-1 text-sm text-gray-500 dark:text-gray-400 break-words leading-relaxed",
                                    task.completed && "line-through"
                                )}>
                                    {task.description}
                                </p>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="mt-1 text-xs text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <FiEdit2 size={10} /> Add description
                                </button>
                            )}
                            {task.attachments && task.attachments.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {task.attachments.map((file, i) => (
                                        <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="block w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:opacity-90 transition-opacity bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center p-1" title={file.name}>
                                            {file.type.startsWith('image/') ? (
                                                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <FiFile size={24} className="text-gray-400 mb-1" />
                                                    <span className="text-[10px] text-gray-500 truncate w-full text-center">{file.name}</span>
                                                </>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            )}
                            {task.createdAt && (
                                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                                    {new Date(task.createdAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                {!isEditing && (
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                            title="Edit"
                        >
                            <FiEdit2 size={16} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-800"
                            title="Delete"
                        >
                            <FiTrash2 size={16} />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default TaskItem;
