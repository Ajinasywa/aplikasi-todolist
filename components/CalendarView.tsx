'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, isSameDay, addDays } from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

interface CalendarViewProps {
  tasks: Task[];
  onClose: () => void;
  onToggle: (id: number, completed: boolean) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onClose, onToggle }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  
  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FiChevronRight size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ml-2"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = 'EEE';
    const days = [];
    let startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-1">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'd';
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        
        // Get tasks for this day
        const dayTasks = tasks.filter(task => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          return isSameDay(taskDate, cloneDay);
        });

        days.push(
          <div
            key={day.toString()}
            className={`min-h-24 p-2 border border-gray-100 dark:border-gray-700 ${
              !isSameMonth(day, monthStart) ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500' : ''
            }`}
          >
            <div className="text-right text-sm mb-1">
              {formattedDate}
            </div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {dayTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`text-xs p-1 rounded truncate ${
                    task.priority === 'High' 
                      ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200' 
                      : task.priority === 'Medium' 
                          ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200' 
                          : 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => onToggle(task.id!, e.target.checked)}
                      className="mr-1 w-3 h-3 rounded"
                    />
                    <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="calendar-body">{rows}</div>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-6xl mx-auto">
      {renderHeader()}
      <div className="calendar-container">
        <div className="calendar">
          {renderDays()}
          {renderCells()}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;