import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  BookOpen,
  Award,
  LogOut,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Analytics', path: '/admin', icon: BarChart3 },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Universities', path: '/admin/universities', icon: BookOpen },
    { name: 'Scholarships', path: '/admin/scholarships', icon: Award },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform bg-slate-950 border-r border-slate-800 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-between px-8 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold tracking-wider">ADMIN PANEL</span>
            </div>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 px-6 py-8 space-y-2">
            <div className="mb-4 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Navigation
            </div>
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-primary shadow-lg shadow-primary/20 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={cn("h-5 w-5", location.pathname === item.path ? "text-white" : "text-slate-500")} />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t border-slate-800">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.full_name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tight">System Admin</p>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-slate-500 hover:text-destructive transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        <header className="h-20 flex items-center justify-between px-8 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
          <button className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 ml-6 lg:ml-0">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-500 uppercase">Server Status</span>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-slate-300">Operational</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
