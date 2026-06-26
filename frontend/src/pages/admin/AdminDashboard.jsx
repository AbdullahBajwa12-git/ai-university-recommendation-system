import React, { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, Activity, Loader2, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { cn } from '../../utils/cn';
import adminService from '../../services/adminService';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [s, a] = await Promise.all([adminService.getStats(), adminService.getAnalytics()]);
        if (active) { setStats(s); setAnalytics(a); }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const cards = stats
    ? [
        { name: 'Total Users', value: stats.total_users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { name: 'Students', value: stats.total_students, icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { name: 'Universities', value: stats.total_universities, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { name: 'AI Sessions', value: stats.total_recommendation_sessions, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
      ]
    : [];

  const sessionsByDay = (analytics?.sessions_by_day || []).map((d) => ({
    label: (d.date || '').slice(5),  // MM-DD
    count: d.count,
  }));
  const hasSessions = sessionsByDay.some((d) => d.count > 0);

  const byCountry = analytics?.universities_by_country || [];
  const hasCountries = byCountry.length > 0;

  const EmptyChart = ({ text }) => (
    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
      <p className="text-sm">Not enough data yet</p>
      <p className="text-xs mt-1">{text}</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="py-12 text-center">
          <AlertCircle className="h-9 w-9 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Couldn't load admin data</h3>
          <p className="text-slate-400 mt-1">Please ensure you're signed in as an admin and the backend is running.</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* KPI Cards — real counts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((stat) => (
              <div
                key={stat.name}
                className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className={cn('p-4 rounded-2xl', stat.bg)}>
                    <stat.icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">Live</span>
                </div>
                <div className="mt-6">
                  <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                  <p className="text-sm font-medium text-slate-400 mt-1">{stat.name}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts — real analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-2">Recommendation Activity</h3>
              <p className="text-xs text-slate-500 mb-6 uppercase tracking-widest font-bold">AI searches per day (last 7 days)</p>
              <div className="h-[320px]">
                {hasSessions ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionsByDay}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '1rem', color: '#fff' }}
                        formatter={(val) => [`${val} sessions`, 'Generated']}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart text="Recommendation searches will appear here once students run them." />
                )}
              </div>
            </div>

            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-2">Universities by Country</h3>
              <p className="text-xs text-slate-500 mb-6 uppercase tracking-widest font-bold">Catalog distribution</p>
              {hasCountries ? (
                <>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={byCountry} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="count" nameKey="country">
                          {byCountry.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val, name) => [`${val}`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 space-y-3 max-h-[160px] overflow-y-auto">
                    {byCountry.map((item, index) => (
                      <div key={item.country} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-sm text-slate-400">{item.country}</span>
                        </div>
                        <span className="text-sm font-bold text-white font-mono">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[200px]"><EmptyChart text="Seed or add universities to see the distribution." /></div>
              )}
            </div>
          </div>

          {/* Top saved universities */}
          <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-2">Most Saved Universities</h3>
            <p className="text-xs text-slate-500 mb-6 uppercase tracking-widest font-bold">Across all students</p>
            {analytics?.top_saved_universities?.length > 0 ? (
              <div className="space-y-3">
                {analytics.top_saved_universities.map((u, i) => (
                  <div key={u.university_name} className="flex items-center justify-between border-b border-slate-700/60 pb-2 last:border-0">
                    <span className="text-sm text-slate-300"><span className="text-slate-500 font-mono mr-3">{i + 1}.</span>{u.university_name}</span>
                    <span className="text-sm font-bold text-white font-mono">{u.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No saved universities yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
