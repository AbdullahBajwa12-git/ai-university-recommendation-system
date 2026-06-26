import React from 'react';
import {
  Users, Search, Filter, Shield, Edit, Trash2, CheckCircle, XCircle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { cn } from '../../utils/cn';
import FutureScopeBanner from '../../components/common/FutureScopeBanner';

const users = [
  { id: 1, name: 'Alex Johnson', email: 'alex@example.com', role: 'admin', status: 'Active', joined: 'Mar 12, 2026' },
  { id: 2, name: 'Sarah Miller', email: 'sarah.m@gmail.com', role: 'student', status: 'Active', joined: 'Jun 05, 2026' },
  { id: 3, name: 'David Smith', email: 'd.smith88@yahoo.com', role: 'student', status: 'Inactive', joined: 'Feb 20, 2026' },
  { id: 4, name: 'Emily White', email: 'ewhite@edu.co', role: 'student', status: 'Active', joined: 'Apr 11, 2026' },
  { id: 5, name: 'Michael Chen', email: 'mchen.admin@fyp.com', role: 'admin', status: 'Active', joined: 'Jan 02, 2026' },
];

const ManageUsers = () => {
  return (
    <div className="space-y-8">
      <FutureScopeBanner message="User management APIs are pending. The users listed below are sample data for demonstration; the action buttons are not wired to a live backend yet." />
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Search users by name, email or role..."
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button size="sm" className="rounded-xl">Add New User</Button>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-700">
                {['User Details', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-7 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-700/30 transition-colors group">
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-slate-200 text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-7 py-5">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                      user.role === 'admin'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-slate-700/50 text-slate-400 border border-slate-600',
                    )}>
                      {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-2">
                      {user.status === 'Active'
                        ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                        : <XCircle className="h-4 w-4 text-slate-600" />}
                      <span className={cn('text-xs font-bold', user.status === 'Active' ? 'text-emerald-500' : 'text-slate-600')}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-7 py-5 text-slate-400 text-sm">{user.joined}</td>
                  <td className="px-7 py-5">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors">
                        <Edit className="h-4 w-4 text-slate-400" />
                      </button>
                      <button className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-7 py-5 bg-slate-900 border-t border-slate-700 flex items-center justify-between">
          <p className="text-xs text-slate-500">Showing 5 of 1,280 users</p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="bg-slate-800 hover:bg-slate-700 rounded-xl h-9 px-4 text-slate-300">Prev</Button>
            <Button size="sm" variant="secondary" className="bg-slate-800 hover:bg-slate-700 rounded-xl h-9 px-4 text-slate-300">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
