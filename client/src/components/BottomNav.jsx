import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiLayers, FiBookOpen, FiBarChart2, FiMoreHorizontal } from 'react-icons/fi';

const tabs = [
  { path: '/', icon: FiHome, label: 'Home' },
  { path: '/flashcards', icon: FiLayers, label: 'Cards' },
  { path: '/quiz', icon: FiBookOpen, label: 'Quiz' },
  { path: '/progress', icon: FiBarChart2, label: 'Progress' },
  { path: '/settings', icon: FiMoreHorizontal, label: 'More' },
];

export default function BottomNav() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg transition-colors ${
              isActive(path)
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            aria-label={label}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
