import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home,
  Compass,
  Sliders,
  Sparkles,
  Moon,
  Sun,
  User, X, Menu } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import studyrouteLogoLight from '../assets/brand/studyroute-logo-light.svg';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


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

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/';
    return location.pathname === path;
  };

  const navLinks = [
    { to: '/dashboard', label: 'Homepage', icon: Home },
    { to: '/preferences', label: 'Preferences', icon: Sliders },
    { to: '/find-universities', label: 'Find Match', icon: Compass },
    { to: '/ai-chat', label: 'AI Advisor', icon: Sparkles },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative z-10">

        {/* ── Top Header ── */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="h-16 md:h-20 flex-shrink-0 flex items-center justify-between px-4 md:px-10 border-b border-[#233e5e] bg-gradient-to-r from-[#152538] via-[#233e5e] to-[#39516e] sticky top-0 z-50 shadow-lg"
        >

          {/* Logo */}
          <div className="flex items-center gap-4 flex-1">
            <img src={studyrouteLogoLight} alt="StudyRoute" className="w-[100px] md:w-[120px] h-auto object-contain block" />
          </div>

          {/* Center Nav Links — hidden on mobile */}
          <div className="hidden md:flex items-center justify-center gap-4 absolute left-1/2 -translate-x-1/2 text-white/80 font-bold text-sm">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.to}
                className="flex items-center gap-4 relative group"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (i * 0.1) }}
              >
                {i > 0 && <span className="text-white/40">|</span>}
                <Link
                  to={link.to}
                  className={cn(
                    'flex items-center gap-2 transition-colors relative py-1',
                    isActive(link.to) ? 'text-white' : 'hover:text-white text-white/80'
                  )}
                >
                  <link.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  {link.label}
                  {isActive(link.to) && (
                    <motion.div layoutId="navIndicator" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full" />
                  )}
                  {!isActive(link.to) && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/50 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center justify-end gap-2 md:gap-4 flex-1">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center text-[#152538] hover:bg-gray-50 transition-colors shadow-sm"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Profile avatar + dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-blue-600 via-teal-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg hover:opacity-90"
              >
                {getInitials(user?.full_name)}
              </button>

              <AnimatePresence>
              {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 origin-top-right"
                >
                  <Link to="/profile" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                    Academic Profile
                  </Link>
                  <Link to="/saveduniversities" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                    Save and Compare
                  </Link>
                  <Link to="/search-history" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                    Search History
                  </Link>
                  <Link to="/scholarships" className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                    Scholarships
                  </Link>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                  <button
                    onClick={() => { setIsProfileDropdownOpen(false); logout(); }}
                    className="w-full text-left block px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Log Out
                  </button>
                </motion.div>
              )}
              </AnimatePresence>
            </div>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.header>

        {/* ── Mobile Dropdown Menu ── */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden absolute top-16 left-0 right-0 z-40 bg-gradient-to-b from-[#1a3148] to-[#233e5e] border-b border-white/10 shadow-2xl"
          >
            <nav className="flex flex-col px-4 py-3 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                    isActive(link.to)
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-white pb-16 md:pb-0">
          <Outlet />
        </main>

        {/* ── Bottom Tab Bar — mobile only ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] flex items-stretch">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold tracking-wide transition-colors',
                isActive(link.to)
                  ? 'text-[#2563EB]'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <link.icon className={cn('w-5 h-5', isActive(link.to) ? 'stroke-[2.5]' : 'stroke-[1.5]')} />
              {link.label}
            </Link>
          ))}
          {/* More button opens profile dropdown shortcut */}
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold tracking-wide transition-colors',
              isProfileDropdownOpen ? 'text-[#2563EB]' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <User className={cn('w-5 h-5', isProfileDropdownOpen ? 'stroke-[2.5]' : 'stroke-[1.5]')} />
            Profile
          </button>
        </nav>

      </div>
    </div>
  );
};

export default StudentLayout;
