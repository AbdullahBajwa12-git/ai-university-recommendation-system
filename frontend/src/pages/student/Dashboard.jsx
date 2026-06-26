import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Bookmark,
  FileCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  History,
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
import { useRecommendations } from '../../hooks/useRecommendations';
import { cn } from '../../utils/cn';

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
  const { history, saved, isLoadingHistory } = useRecommendations();

  // Last 3 searches for the activity panel
  const recentSearches = history.slice(0, 3);

  // Real, derived metrics (no fabricated numbers)
  const savedCount = saved.length;
  const searchCount = history.length;
  const totalMatched = history.reduce((sum, s) => sum + (s.total_count || 0), 0);
  const lastMatchCount = history[0]?.total_count || 0;
  const chartData = history
    .slice(0, 6)
    .reverse()
    .map((s) => ({
      name: s.intended_major ? s.intended_major.slice(0, 12) : 'Search',
      count: s.total_count || 0,
    }));

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
          <Link to="/profile" className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">Update Profile</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Saved Universities" value={savedCount} subtext="In your bookmarks" icon={Bookmark} colorClass="bg-amber-500" />
        <StatCard title="AI Searches" value={searchCount} subtext="Recommendation runs" icon={Sparkles} colorClass="bg-indigo-500" />
        <StatCard title="Universities Matched" value={totalMatched} subtext="Across all searches" icon={TrendingUp} colorClass="bg-blue-500" />
        <StatCard title="Latest Search" value={lastMatchCount} subtext="Matches in your last search" icon={FileCheck} colorClass="bg-emerald-500" />
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Universities Found per Search</h3>
          <div className="h-[280px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '0.75rem' }}
                    formatter={(val) => [`${val} universities`, 'Found']}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <p className="text-sm">No searches yet.</p>
                <p className="text-xs mt-1">Run a search to see your match history here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-500" /> Recent Searches
          </h3>
          <div className="space-y-6">
            {isLoadingHistory ? (
              [1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl" />)
            ) : recentSearches.length > 0 ? (
              recentSearches.map((session, i) => (
                <div key={session.session_id} className="relative pl-8">
                  {i < recentSearches.length - 1 && (
                    <div className="absolute left-[9px] top-4 bottom-[-20px] w-[2px] bg-gray-100 dark:bg-gray-700" />
                  )}
                  <div className="absolute left-0 top-1 h-[18px] w-[18px] rounded-full bg-indigo-500 border-4 border-white dark:border-gray-800" />
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                    {session.intended_major || 'Any Major'} · {session.degree_applying_for || 'Any Degree'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(session.created_at).toLocaleDateString()} • {session.total_count} universities found
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">No searches yet. Start your first recommendation!</p>
            )}
          </div>
          <Link 
            to="/find-universities"
            className="block w-full mt-8 py-3 text-sm font-semibold text-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors border border-blue-200 dark:border-blue-800 border-dashed"
          >
            View All History
          </Link>
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
          <div className="flex justify-end items-end">
            <Link to="/find-universities" className="text-xs font-bold text-emerald-500 hover:underline">Find matches →</Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="text-amber-500 h-5 w-5" />
            <h4 className="font-bold text-gray-800 dark:text-white">Moderate Schools</h4>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Probability between 50–80%</p>
          <div className="flex justify-end items-end">
            <Link to="/find-universities" className="text-xs font-bold text-amber-500 hover:underline">Find matches →</Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="text-red-500 h-5 w-5" />
            <h4 className="font-bold text-gray-800 dark:text-white">Reach Schools</h4>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Probability &lt; 50%</p>
          <div className="flex justify-end items-end">
            <Link to="/find-universities" className="text-xs font-bold text-red-500 hover:underline">Find matches →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
