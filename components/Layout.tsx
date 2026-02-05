import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { FiMenu, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0 h-screen sticky top-0 overflow-hidden">
                <React.Suspense fallback={<div className="w-full h-full bg-white dark:bg-gray-900" />}>
                    <Sidebar className="w-full h-full" />
                </React.Suspense>
            </div>

            {/* Mobile Header & Sidebar Drawer */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                        <FiMenu size={24} />
                    </button>
                    <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        TaskMaster
                    </span>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
                        />

                        {/* Sidebar Drawer */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 md:hidden shadow-xl"
                        >
                            <div className="flex justify-end p-2 absolute top-2 right-2 z-10">
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                            <React.Suspense fallback={<div className="h-full w-full" />}>
                                <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
                            </React.Suspense>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mt-14 md:mt-0">
                {children}
            </main>
        </div>
    );
};

export default Layout;
