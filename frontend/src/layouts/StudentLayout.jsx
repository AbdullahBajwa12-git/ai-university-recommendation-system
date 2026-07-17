import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCircle, 
  School, 
  Sparkles, 
  FileText, 
  LogOut,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  Award,
  SlidersHorizontal,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Find Universities', path: '/find-universities', icon: Sparkles, highlight: true },
    { name: 'Profile', path: '/profile', icon: UserCircle },
    { name: 'Preferences', path: '/preferences', icon: SlidersHorizontal },
    { name: 'Discover', path: '/universities', icon: School },
    { name: 'AI Recommendations', path: '/find-universities', icon: Sparkles },
    { name: 'Admission Predictor', path: '/predict', icon: TrendingUp },
    { name: 'Resume Analyzer', path: '/resume-analyzer', icon: FileCheck },
    { name: 'SOP Analyzer', path: '/sop-analyzer', icon: FileText },
    { name: 'Scholarships', path: '/scholarships', icon: Award },
    { name: 'Applications', path: '/applications', icon: CheckCircle2 },
    { name: 'AI Chat Advisor', path: '/ai-chat', icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <span className="text-xl font-bold text-primary">AI Advisor</span>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : item.highlight 
                      ? "text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10"
                      : "text-muted-foreground hover:bg-secondary"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <button 
              onClick={logout}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-destructive rounded-lg hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-card border-b sticky top-0 z-30">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 ml-4 lg:ml-0">
            <h1 className="text-lg font-semibold truncate">
              {navItems.find(i => i.path === location.pathname)?.name || 'Page'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-secondary"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button className="p-2 rounded-full hover:bg-secondary relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
            </button>
            <div className="flex items-center gap-2 border-l pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium line-clamp-1">{user?.full_name || 'Student'}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border">
                <UserCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
