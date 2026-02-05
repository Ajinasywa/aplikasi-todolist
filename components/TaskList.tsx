import React from 'react';
import { Task } from '@/types';
import TaskItem from './TaskItem';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInbox } from 'react-icons/fi';

interface TaskListProps {
    tasks: Task[];
    onToggle: (id: number, completed: boolean) => void;
    onDelete: (id: number) => void;
    onUpdate: (updatedTask: Task) => Promise<void>;
    filter: string;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, onDelete, onUpdate, filter }) => {
    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4 text-gray-400 dark:text-gray-500">
                    <FiInbox size={32} />
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {filter === 'all' ? "You're all caught up!" : `No ${filter} tasks`}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                    {filter === 'all'
                        ? "No tasks yet. Create one to get started."
                        : `There are no tasks in the ${filter} category.`}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <AnimatePresence mode='popLayout' initial={false}>
                {tasks.map((task) => (
                    <TaskItem
                        key={task.id} // Ensure ID is present. If id is optional in type, we assume it's there after creation.
                        task={task}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default TaskList;
