import React from 'react';
import { ThemeToggle } from './ThemeToggle';

const Header: React.FC = () => {
    return (
        <header className="mb-8 relative flex flex-col items-center justify-center">
            <div className="absolute right-0 top-0">
                <ThemeToggle />
            </div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400 pb-2">
                To-Do List
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                Manage your tasks efficiently
            </p>
        </header>
    );
};

export default Header;
