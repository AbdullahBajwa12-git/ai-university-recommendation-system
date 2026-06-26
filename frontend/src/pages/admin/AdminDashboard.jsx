import React from 'react';
import { Users, BookOpen, Globe, Activity } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { cn } from '../../utils/cn';
import FutureScopeBanner from '../../components/common/FutureScopeBanner';

const stats = [
  { name: 'Total Users', value: '1,284', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { name: 'Universities', value: '452', icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { name: 'Countries', value: '18', icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { name: 'Predictions', value: '15,420', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
];

const chartData = [
  { month: 'Jan', users: 400, predictions: 2400 },
  { month: 'Feb', users: 600, predictions: 3600 },
  { month: 'Mar', users: 800, predictions: 4100 },
  { month: 'Apr', users: 1200, predictions: 5800 },
  { month: 'May', users: 1500, predictions: 8200 },
  { month: 'Jun', users: 2100, predictions: 12000 },
];

const countryData = [
  { name: 'USA', value: 40 },
  { name: 'Canada', value: 25 },
  { name: 'UK', value: 20 },
  { name: 'Germany', value: 10 },
  { name: 'Others', value: 5 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const AdminDashboard = () => {
  return (
    <div className="space-y-8 pb-12">
      <FutureScopeBanner message="Admin analytics APIs are pending. The metrics and charts below are sample data for demonstration and do not reflect live system activity yet." />
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className={cn('p-4 rounded-2xl', stat.bg)}>
                <stat.icon className={cn('h-6 w-6', stat.color)} />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Live</span>
            </div>
            <div className="mt-6">
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-400 mt-1">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-8">System Utilization</h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '1rem', color: '#fff' }} />
                <Area type="monotone" dataKey="predictions" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPred)" />
                <Area type="monotone" dataKey="users" stroke="#64748b" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-2">Market Interest</h3>
          <p className="text-sm text-slate-500 mb-6">Country-wise applications</p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={countryData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={6} dataKey="value">
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {countryData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-sm text-slate-400">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-white font-mono">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
