import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { FiGrid, FiList, FiCheckCircle, FiSettings, FiLogOut, FiCalendar } from 'react-icons/fi';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
    className?: string;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ className, onClose }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentFilter = searchParams.get('filter') || 'all';
    const currentCategory = searchParams.get('category') || 'All';
    const { logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', icon: FiGrid, href: '/', filter: 'all' },
        { name: 'Active Tasks', icon: FiList, href: '/?filter=active', filter: 'active' },
        { name: 'Completed', icon: FiCheckCircle, href: '/?filter=completed', filter: 'completed' },
        { name: 'Calendar', icon: FiCalendar, href: '/?view=calendar', filter: 'calendar' },
    ];

    const categories = ['Personal', 'Work', 'Study', 'Shopping', 'Others'];

    const isActive = (href: string, itemFilter?: string) => {
        // Special case for Calendar
        if (itemFilter === 'calendar') {
            return searchParams.get('view') === 'calendar';
        }
        if (pathname !== '/') return pathname === href;

        // For home page, check filters
        if (itemFilter) {
            return currentFilter === itemFilter && !searchParams.get('category') && !searchParams.get('view');
        }
        return false;
    };

    const isCategoryActive = (cat: string) => {
        return currentCategory === cat;
    };

    return (
        <aside className={clsx("flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-colors", className)}>
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    TaskMaster
                </h1>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 space-y-8">
                {/* Main Navigation */}
                <div className="space-y-1">
                    <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Menu
                    </p>
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive(item.href, item.filter)
                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Categories */}
                <div className="space-y-1">
                    <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Categories
                    </p>
                    {categories.map((cat) => (
                        <Link
                            key={cat}
                            href={`/?category=${cat}`}
                            onClick={onClose}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isCategoryActive(cat)
                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            <span className={clsx(
                                "w-2 h-2 rounded-full",
                                isCategoryActive(cat) ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                            )} />
                            {cat}
                        </Link>
                    ))}
                </div>
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                {/* Theme Toggle Button (Customized for sidebar) */}
                <div className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                        <FiSettings size={18} />
                        <span>Theme</span>
                    </div>
                    <ThemeToggle />
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    <FiLogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
