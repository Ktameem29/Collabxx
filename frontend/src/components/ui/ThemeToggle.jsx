import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-6 rounded-full bg-navy-600 border border-navy-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-navy-900"
      aria-label="Toggle theme"
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center shadow-md"
        animate={{ x: isDark ? 0 : 24 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {isDark ? <Moon size={11} className="text-white" /> : <Sun size={11} className="text-white" />}
      </motion.div>
    </button>
  );
}
