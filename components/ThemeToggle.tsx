"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { FiMoon, FiSun } from "react-icons/fi"
import { motion } from "framer-motion"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="w-10 h-10" /> // Placeholder to prevent layout shift
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === "dark" ? 180 : 0 }}
                transition={{ duration: 0.3 }}
            >
                {theme === "dark" ? (
                    <FiMoon className="w-5 h-5 text-blue-400" />
                ) : (
                    <FiSun className="w-5 h-5 text-amber-500" />
                )}
            </motion.div>
        </button>
    )
}
