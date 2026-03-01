import { useEffect, useState } from 'react';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top bar */}
      <div className="h-14 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Vellum Clone
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Professional Book Formatting Tool
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Main content area - placeholder for 3-panel layout */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vellum Clone
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            A professional book formatting tool for creating beautiful ebooks and print-ready PDFs.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <button className="btn-primary">
              New Project
            </button>
            <button className="btn-secondary">
              Open Project
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-8">
            Phase 1: Electron Foundation ✓
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
