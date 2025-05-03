import { useTheme } from '@/theme/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <nav className="flex justify-between items-center py-4 px-6 fixed w-full z-10">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full transition-colors bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-900" />}
      </button>
    </nav>
  );
}
