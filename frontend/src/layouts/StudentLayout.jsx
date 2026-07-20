import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  Heart,
  BookOpen,
  Award,
  User,
  Sliders,
  Sparkles,
  MessageSquare,
  MoreVertical,
  History,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const StudentLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'AS';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const navGroups = [
    {
      label: 'MAIN JOURNEY',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: Home },
        { name: 'Find Universities', path: '/find-universities', icon: Compass },
        { name: 'Saved and Compare', path: '/saveduniversities', icon: Heart },
        { name: 'University Directory', path: '/universities', icon: BookOpen },
        { name: 'Scholarships', path: '/scholarships', icon: Award },
      ]
    },
    {
      label: 'YOUR PROFILE',
      items: [
        { name: 'Academic Profile', path: '/profile', icon: User },
        { name: 'Study Preferences', path: '/preferences', icon: Sliders },
        { name: 'Search History', path: '/search-history', icon: History },
      ]
    },
    {
      label: 'GUIDANCE',
      items: [
        { name: 'AI Study Advisor', path: '/ai-chat', icon: Sparkles },
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans">
      {/* Sidebar */}
      <aside className="w-[280px] bg-[#F8F9FA] border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-50">
        {/* Logo */}
        <div className="h-20 flex items-center px-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">StudyRoute</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-4 px-2">
                {group.label}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                          isActive
                            ? "bg-[#E6F0FF] text-[#2563EB]"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-lg",
                          isActive ? "bg-[#2563EB] text-white" : "bg-gray-100/80 text-gray-500"
                        )}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Account */}
        <div className="p-6">
          <div className="flex items-center gap-3 bg-gray-100/80 p-3 rounded-2xl cursor-pointer hover:bg-gray-200 transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm">
              {getInitials(user?.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.full_name || 'Abdullah Shahid'}</p>
              <p className="text-xs text-gray-500 truncate">Student account</p>
            </div>
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-[280px] flex flex-col min-w-0 bg-white rounded-tl-3xl shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] relative z-10 overflow-hidden border-l border-gray-100">
        {/* Top Navbar */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-gray-100 bg-white">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-400">
              Student workspace / <span className="text-gray-900">Dashboard</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
              <Sparkles className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm ml-2">
              {getInitials(user?.full_name)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
