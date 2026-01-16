import { Menu, Sun, Bell } from 'lucide-react';
// Note: We'll implement ThemeContext later, for now just UI

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="fixed top-0 right-0 z-20 w-full lg:w-[calc(100%-16rem)] h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 hidden sm:block">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle - Placeholder functionality */}
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
          <Sun className="w-5 h-5" />
        </button>
        
        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-card"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Admin User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">admin@gastro.uz</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
            AU
          </div>
        </div>
      </div>
    </header>
  );
}
