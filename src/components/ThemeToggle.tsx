import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      onClick={cycle}
      className="p-2 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors"
      aria-label={`Current theme: ${theme}. Click to change.`}
    >
      {theme === 'light' && <Sun size={18} className="text-light-text" />}
      {theme === 'dark' && <Moon size={18} className="text-dark-text" />}
      {theme === 'system' && <Monitor size={18} className="text-light-secondary dark:text-dark-secondary" />}
    </button>
  );
}
