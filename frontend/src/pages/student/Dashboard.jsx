import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Bookmark,
  FileCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const data = [
  { name: 'Uni A', probability: 85 },
  { name: 'Uni B', probability: 62 },
  { name: 'Uni C', probability: 45 },
  { name: 'Uni D', probability: 92 },
  { name: 'Uni E', probability: 30 },
];

const activity = [
  { id: 1, text: 'Generated prediction for MIT', time: '2 hours ago' },
  { id: 2, text: 'Saved Stanford University', time: '5 hours ago' },
  { id: 3, text: 'Applied to University of Waterloo', time: '1 day ago' },
];

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{value}</h3>
      <p className="text-xs text-gray-400 mt-1">{subtext}</p>
    </div>
    <div className={cn('p-3 rounded-xl', colorClass)}>
      <Icon className="h-6 w-6 text-white" />
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || 'Student';

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome back, {firstName}!
          </h1>
          <p className="text-gray-500 mt-1">Here's your admissions journey overview.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Link to="/find-universities" className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all text-sm font-black italic">
            <Sparkles className="h-4 w-4" /> Find Universities Now
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">Profile 85% Complete</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Avg. Probability" value="68%" subtext="+5% from last week" icon={TrendingUp} colorClass="bg-blue-500" />
        <StatCard title="Universities" value="12" subtext="Saved in your list" icon={Bookmark} colorClass="bg-amber-500" />
        <StatCard title="Applications" value="4" subtext="2 pending review" icon={FileCheck} colorClass="bg-emerald-500" />
        <StatCard title="AI Matches" value="24" subtext="New programs found" icon={Sparkles} colorClass="bg-indigo-500" />
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Admission Probabilities</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '0.75rem' }}
                  formatter={(val) => [`${val}%`, 'Probability']}
                />
                <Bar dataKey="probability" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Recent Activity</h3>
          <div className="space-y-6">
            {activity.map((item, i) => (
              <div key={item.id} className="relative pl-8">
                {i < activity.length - 1 && (
                  <div className="absolute left-[9px] top-4 bottom-[-20px] w-[2px] bg-gray-100 dark:bg-gray-700" />
                )}
                <div className="absolute left-0 top-1 h-[18px] w-[18px] rounded-full bg-blue-500 border-4 border-white dark:border-gray-800" />
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.text}</p>
                <p className="text-xs text-gray-400 mt-1">{item.time}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors border border-blue-200 dark:border-blue-800 border-dashed">
            View All History
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="text-emerald-500 h-5 w-5" />
            <h4 className="font-bold text-gray-800 dark:text-white">Safe Schools</h4>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Admission probability &gt; 80%</p>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-bold text-emerald-500">8</span>
            <Link to="/universities" className="text-xs font-bold text-emerald-500 hover:underline">Explore →</Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="text-amber-500 h-5 w-5" />
            <h4 className="font-bold text-gray-800 dark:text-white">Moderate Schools</h4>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Probability between 50–80%</p>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-bold text-amber-500">12</span>
            <Link to="/universities" className="text-xs font-bold text-amber-500 hover:underline">Explore →</Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="text-red-500 h-5 w-5" />
            <h4 className="font-bold text-gray-800 dark:text-white">Reach Schools</h4>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Probability &lt; 50%</p>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-bold text-red-500">4</span>
            <Link to="/universities" className="text-xs font-bold text-red-500 hover:underline">Explore →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
