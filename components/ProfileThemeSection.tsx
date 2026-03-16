'use client';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/components/ThemeProvider';

export default function ProfileThemeSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`flex justify-between items-center border-b pb-3 ${
        isDark ? 'border-gray-800' : 'border-gray-200'
      }`}
    >
      <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
        Appearance
      </p>
      <div className="flex items-center gap-2">
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {isDark ? 'Dark' : 'Light'}
        </span>
        <ThemeToggle />
      </div>
    </div>
  );
}
