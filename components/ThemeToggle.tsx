'use client';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
        isDark ? 'bg-purple-600' : 'bg-amber-400'
      }`}
    >
      <span
        className={`absolute left-0.5 w-5 h-5 rounded-full shadow transition-transform duration-300 flex items-center justify-center text-[10px] ${
          isDark
            ? 'translate-x-0 bg-gray-900 text-purple-300'
            : 'translate-x-6 bg-white text-amber-500'
        }`}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
