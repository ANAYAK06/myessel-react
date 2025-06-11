// src/components/ThemeToggle.js
import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ variant = 'simple', showLabel = true, className = '' }) => {
  const { theme, toggleTheme, setLightTheme, setDarkTheme, setSystemTheme, isDark } = useTheme();

  // Simple toggle for login screen
  if (variant === 'simple') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2 ${className}`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-600" />
        )}
        {showLabel && (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        )}
      </button>
    );
  }

  // Dropdown variant for navbar
  if (variant === 'dropdown') {
    return (
      <div className="relative group">
        <button 
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Theme Settings"
        >
          {theme === 'light' && <Sun className="w-5 h-5 text-yellow-500" />}
          {theme === 'dark' && <Moon className="w-5 h-5 text-indigo-400" />}
          {theme === 'system' && <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
        </button>
        
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-2">
            <button
              onClick={setLightTheme}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                theme === 'light' ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              <Sun className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Light</span>
            </button>
            
            <button
              onClick={setDarkTheme}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                theme === 'dark' ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Dark</span>
            </button>
            
            <button
              onClick={setSystemTheme}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                theme === 'system' ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              <Monitor className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">System</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default icon only
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600" />
      )}
    </button>
  );
};

export default ThemeToggle;