import React, { useState } from 'react';
import { Task } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi';
import clsx from 'clsx';

interface CalendarViewProps {
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getDayContent = (day: number) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];

        const createdTasks = tasks.filter(task => {
            if (!task.createdAt) return false;
            // Handle ISO strings potentially having time components
            return task.createdAt.startsWith(dateStr);
        });

        const dueTasks = tasks.filter(task => task.dueDate === dateStr);

        return { createdTasks, dueTasks };
    };

    const renderCalendarDays = () => {
        const days = [];
        const today = new Date();
        const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

        // Empty cells for days before start of month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 sm:h-32 bg-gray-50/50 dark:bg-gray-900/20 border-r border-b border-gray-100 dark:border-gray-800" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const { createdTasks, dueTasks } = getDayContent(day);
            const isToday = isCurrentMonth && day === today.getDate();

            days.push(
                <div key={day} className={clsx(
                    "h-24 sm:h-32 border-r border-b border-gray-100 dark:border-gray-800 p-2 relative group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    isToday && "bg-blue-50/50 dark:bg-blue-900/10"
                )}>
                    <div className="flex justify-between items-start mb-1">
                        <span className={clsx(
                            "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                            isToday ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300"
                        )}>
                            {day}
                        </span>
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[calc(100%-2rem)] custom-scrollbar">
                        {/* Created Tasks (Start) */}
                        {createdTasks.map(task => (
                            <div
                                key={`start-${task.id}`}
                                className="text-[10px] sm:text-xs p-1 rounded border border-green-200 bg-green-50 text-green-700 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-300 truncate cursor-pointer flex items-center gap-1"
                                title={`Started: ${task.title}`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                <span className="truncate">Start: {task.title}</span>
                            </div>
                        ))}

                        {/* Due Tasks (End) */}
                        {dueTasks.map(task => (
                            <div
                                key={`due-${task.id}`}
                                className={clsx(
                                    "text-[10px] sm:text-xs p-1 rounded border truncate cursor-pointer flex items-center gap-1",
                                    task.completed ? "line-through opacity-50 bg-gray-100 text-gray-500 border-gray-200" :
                                        (task.priority === 'high' ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30" :
                                            task.priority === 'medium' ? "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/30" :
                                                "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30")
                                )}
                                title={`Due: ${task.title}`}
                            >
                                <FiClock size={10} className="shrink-0" />
                                <span className="truncate">{task.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return days;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FiClock className="text-blue-500" />
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <FiChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <FiChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 bg-white dark:bg-gray-800">
                {renderCalendarDays()}
            </div>
        </div>
    );
};

export default CalendarView;
