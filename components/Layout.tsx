import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100 flex justify-center">
            <div className="w-full max-w-2xl px-6 py-12">
                {children}
            </div>
        </div>
    );
};

export default Layout;
