import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Shield, Edit, Trash2, CheckCircle, XCircle, Loader2, AlertCircle, Save, X, Power,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import { cn } from '../../utils/cn';
import FutureScopeBanner from '../../components/common/FutureScopeBanner';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('student');
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await adminService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditName(u.full_name || '');
    setEditRole(u.role);
  };
  const cancelEdit = () => { setEditingId(null); setEditName(''); };

  const saveEdit = async (u) => {
    setSavingId(u.id);
    try {
      await adminService.updateUser(u.id, { full_name: editName.trim(), role: editRole });
      toast.success('User updated');
      setEditingId(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update user');
    } finally {
      setSavingId(null);
    }
  };

  const toggleActive = async (u) => {
    const deactivating = u.is_active;
    if (deactivating && !window.confirm(`Deactivate ${u.full_name || u.email}? They will not be able to sign in.`)) return;
    setSavingId(u.id);
    try {
      await adminService.updateUser(u.id, { is_active: !u.is_active });
      toast.success(deactivating ? 'User deactivated' : 'User reactivated');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setSavingId(null);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? users.filter((u) => [u.full_name, u.email, u.role].filter(Boolean).some((v) => v.toLowerCase().includes(q)))
    : users;

  const fmtDate = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString(); } catch { return '—'; }
  };

  return (
    <div className="space-y-8">
      <FutureScopeBanner message="User data and edits below are live. You can rename, change role, and activate/deactivate users. Permanent deletion is intentionally disabled." />

      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Search users by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="py-12 text-center">
          <AlertCircle className="h-9 w-9 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Couldn't load users</h3>
          <p className="text-slate-400 mt-1">Please ensure you're signed in as an admin and the backend is running.</p>
        </div>
      )}

      {!loading && !error && (
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
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-7 py-10 text-center text-slate-500 text-sm">No users found.</td></tr>
                ) : filtered.map((user) => {
                  const isEditing = editingId === user.id;
                  const isSelf = currentUser && currentUser.id === user.id;
                  const busy = savingId === user.id;
                  return (
                    <tr key={user.id} className="hover:bg-slate-700/30 transition-colors group">
                      <td className="px-7 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-slate-200 text-sm">
                            {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            {isEditing ? (
                              <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Full name"
                                className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            ) : (
                              <p className="font-bold text-white text-sm">{user.full_name || '—'}</p>
                            )}
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-7 py-5">
                        {isEditing ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            disabled={isSelf}
                            title={isSelf ? "You can't change your own role" : undefined}
                            className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
                          >
                            <option value="student">student</option>
                            <option value="admin">admin</option>
                          </select>
                        ) : (
                          <span className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                            user.role === 'admin'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-slate-700/50 text-slate-400 border border-slate-600',
                          )}>
                            {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-7 py-5">
                        <div className="flex items-center gap-2">
                          {user.is_active
                            ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                            : <XCircle className="h-4 w-4 text-slate-600" />}
                          <span className={cn('text-xs font-bold', user.is_active ? 'text-emerald-500' : 'text-slate-600')}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-7 py-5 text-slate-400 text-sm">{fmtDate(user.created_at)}</td>
                      <td className="px-7 py-5">
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={() => saveEdit(user)} disabled={busy} title="Save"
                                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50">
                                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                              </button>
                              <button onClick={cancelEdit} disabled={busy} title="Cancel"
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(user)} title="Edit name / role"
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors">
                                <Edit className="h-4 w-4 text-slate-300" />
                              </button>
                              <button
                                onClick={() => toggleActive(user)}
                                disabled={busy || (isSelf && user.is_active)}
                                title={isSelf && user.is_active ? "You can't deactivate yourself" : (user.is_active ? 'Deactivate' : 'Reactivate')}
                                className={cn(
                                  'p-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed',
                                  user.is_active ? 'bg-slate-800 hover:bg-amber-500/20 text-amber-400' : 'bg-slate-800 hover:bg-emerald-500/20 text-emerald-400',
                                )}>
                                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
                              </button>
                              <button title="Permanent deletion is disabled" disabled
                                className="p-2 rounded-xl bg-slate-800 opacity-40 cursor-not-allowed">
                                <Trash2 className="h-4 w-4 text-slate-400" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-7 py-5 bg-slate-900 border-t border-slate-700 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {filtered.length} of {users.length} user{users.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
