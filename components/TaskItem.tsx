import React, { useState } from 'react';
import { Task } from '@/types';
import { motion } from 'framer-motion';
import { FiTrash2, FiEdit2, FiCheck, FiFile } from 'react-icons/fi';
import clsx from 'clsx';
import TaskEditorModal from './TaskEditorModal';

interface TaskItemProps {
    task: Task;
    onToggle: (id: number, completed: boolean) => void;
    onDelete: (id: number) => void;
    onUpdate: (updatedTask: Task) => Promise<void>;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            onDelete(task.id!);
        }
    };

    const handleSave = async (updatedTask: Task) => {
        await onUpdate(updatedTask);
    };

    return (
        <>
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
                        <div className={`transition-all ${task.completed ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-2">
                                <h3 className={clsx(
                                    "text-lg font-medium text-gray-900 dark:text-gray-100 leading-snug break-words",
                                    task.completed && "line-through text-gray-500"
                                )}>
                                    {task.title}
                                </h3>
                                {task.priority && (
                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${task.priority === 'High'
                                            ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800'
                                            : task.priority === 'Medium'
                                                ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
                                                : 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 border-green-200 dark:border-green-800'
                                        }`}>
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

                            {/* Attachments */}
                            {task.attachments && task.attachments.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {task.attachments.map((file, i) => (
                                        <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="block w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:opacity-90 transition-opacity bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center p-1" title={file.fileName}>
                                            {file.fileType.startsWith('image/') ? (
                                                <img src={file.url} alt={file.fileName} className="w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <FiFile size={24} className="text-gray-400 mb-1" />
                                                    <span className="text-[10px] text-gray-500 truncate w-full text-center">{file.fileName}</span>
                                                </>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            )}

                            {/* Due Date & Created At */}
                            <div className="flex flex-col gap-1 mt-2">
                                {task.dueDate && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </p>
                                )}
                                {task.createdAt && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                        Created: {new Date(task.createdAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
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
                </div>
            </motion.div>

            <TaskEditorModal
                task={task}
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                onSave={handleSave}
            />
        </>
    );
};

export default TaskItem;
