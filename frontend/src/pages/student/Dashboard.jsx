import { Link } from 'react-router-dom';
import {
  Heart,
  Target,
  Award,
  ArrowRightLeft,
  ArrowRight,
  Bookmark,
  Sparkles,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRecommendations } from '../../hooks/useRecommendations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ icon: Icon, number, title, subtext }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 mb-6">
      <Icon className="w-5 h-5 text-gray-700" />
    </div>
    <div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{number}</h3>
      <p className="text-sm font-bold text-gray-900 mb-1">{title}</p>
      <p className="text-xs text-gray-500">{subtext}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || 'Abdullah';

  const { saved, history } = useRecommendations();

  const savedCount = saved?.length || 0;
  const searchCount = history?.length || 0;
  const totalMatched = history?.reduce((sum, s) => sum + (s.total_count || 0), 0) || 0;
  const lastMatchCount = history?.[0]?.total_count || 0;

  const chartData = history
    ? history.slice(0, 6).reverse().map((s) => ({
        name: s.intended_major ? s.intended_major.slice(0, 12) : 'Search',
        count: s.total_count || 0,
      }))
    : [];

  return (
    <div className="max-w-[1200px] mx-auto w-full p-8 font-sans pb-20">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <p className="text-[#2563EB] font-bold text-xs tracking-widest uppercase mb-3">
            SUNDAY, 19 JULY
          </p>
          <h1 className="text-[40px] leading-none font-bold text-[#111827] mb-3 tracking-tight font-serif">
            Good evening, {firstName}.
          </h1>
          <p className="text-gray-500 text-sm">
            Your shortlist is taking shape. Continue from the next meaningful step.
          </p>
        </div>
        <Link
          to="/find-universities"
          className="bg-gradient-to-r from-[#2563EB] to-[#0ea5e9] text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
        >
          Find my universities <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Banner */}
        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-slate-800 text-white p-8 md:p-10 min-h-[300px] flex flex-col justify-between shadow-md">
          {/* Background image overlay mock */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e293b] via-[#1e293b]/90 to-transparent z-10" />
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center mix-blend-overlay" />

          <div className="relative z-20">
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white mb-6">
              Journey progress · 68%
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 max-w-[400px] leading-tight font-serif">
              One more step before your personalised shortlist.
            </h2>
            <p className="text-white/80 text-sm max-w-[420px] leading-relaxed mb-8">
              Your academic profile is complete. Add two preferred destinations and confirm your annual budget.
            </p>
          </div>

          <div className="relative z-20">
            <div className="h-2 w-full bg-white/20 rounded-full mb-3 flex overflow-hidden">
              <div className="h-full bg-blue-500 w-1/4 rounded-full" />
              <div className="h-full bg-teal-400 w-1/4 rounded-full -ml-2" />
            </div>
            <div className="flex gap-2 text-[11px] font-bold">
              <span className="px-3 py-1 bg-teal-500 text-white rounded-full">✓ Profile</span>
              <span className="px-3 py-1 bg-teal-500 text-white rounded-full">✓ Tests</span>
              <span className="px-3 py-1 bg-amber-500 text-white rounded-full">3 Preferences</span>
              <span className="px-3 py-1 bg-white/20 text-white/50 rounded-full">4 UniFinder</span>
            </div>
          </div>
        </div>

        {/* Profile Strength */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-[#2563EB] font-bold text-xs tracking-widest uppercase mb-6">
              PROFILE STRENGTH
            </h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-5xl font-bold text-gray-900 tracking-tighter">84</span>
              <span className="text-2xl font-bold text-gray-400">%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full mb-6">
              <div className="h-full bg-teal-400 w-[84%] rounded-full" />
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              Strong enough to generate meaningful matches. Adding test evidence can improve confidence.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/profile"
              className="w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors block text-center"
            >
              Update Profile
            </Link>
            <Link
              to="/search-history"
              className="w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors block text-center"
            >
              View Search History
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic Activity Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={() => <Bookmark className="w-5 h-5 text-amber-500" />}
          number={savedCount}
          title="Saved Universities"
          subtext="In your bookmarks"
        />
        <StatCard
          icon={() => <Sparkles className="w-5 h-5 text-indigo-500" />}
          number={searchCount}
          title="AI Searches"
          subtext="Recommendation runs"
        />
        <StatCard
          icon={() => <TrendingUp className="w-5 h-5 text-blue-500" />}
          number={totalMatched}
          title="Universities Matched"
          subtext="Across all searches"
        />
        <StatCard
          icon={() => <FileCheck className="w-5 h-5 text-emerald-500" />}
          number={lastMatchCount}
          title="Latest Search"
          subtext="Matches in your last search"
        />
      </div>

      {/* Static Target Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={() => <Heart className="w-5 h-5 text-blue-400" />}
          number="12"
          title="Saved universities"
          subtext="+3 since last week"
        />
        <StatCard
          icon={() => <Target className="w-5 h-5 text-teal-400" />}
          number="04"
          title="Shortlists generated"
          subtext="Most recent: 18 July"
        />
        <StatCard
          icon={() => <Award className="w-5 h-5 text-amber-500" />}
          number="07"
          title="Scholarships tracked"
          subtext="2 deadlines approaching"
        />
        <StatCard
          icon={() => <ArrowRightLeft className="w-5 h-5 text-pink-400" />}
          number="03"
          title="Compared options"
          subtext="UK · Canada · Australia"
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Universities Found per Search</h3>
        <div className="h-[300px]">
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

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Shortlist */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Your latest shortlist</h3>
              <p className="text-sm text-gray-500">Recommendations generated from verified candidate records.</p>
            </div>
            <Link to="/find-universities" className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
              Open results <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all bg-white">
              <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wider mb-3">TARGET</span>
              <h4 className="font-bold text-gray-900 mb-1">University of Edinburgh</h4>
              <p className="text-xs text-gray-500">United Kingdom · 92% match</p>
            </div>
            <div className="p-5 rounded-2xl border border-gray-100 hover:border-teal-100 hover:shadow-md transition-all bg-white">
              <span className="inline-block px-2 py-1 bg-teal-50 text-teal-600 text-[10px] font-bold rounded uppercase tracking-wider mb-3">SAFE</span>
              <h4 className="font-bold text-gray-900 mb-1">University of Calgary</h4>
              <p className="text-xs text-gray-500">Canada · 89% match</p>
            </div>
            <div className="p-5 rounded-2xl border border-gray-100 hover:border-pink-100 hover:shadow-md transition-all bg-white">
              <span className="inline-block px-2 py-1 bg-pink-50 text-pink-600 text-[10px] font-bold rounded uppercase tracking-wider mb-3">REACH</span>
              <h4 className="font-bold text-gray-900 mb-1">Monash University</h4>
              <p className="text-xs text-gray-500">Australia · 81% match</p>
            </div>
          </div>
        </div>

        {/* Scholarship deadlines */}
        <div className="bg-[#FFFDF5] rounded-3xl border border-[#FBECC8] p-8 shadow-sm">
          <span className="inline-block px-3 py-1 bg-[#FBECC8] text-amber-700 text-xs font-bold rounded-full mb-6">
            2 upcoming
          </span>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Scholarship deadlines</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-[#FBECC8]/60">
              <span className="text-sm font-medium text-gray-800">Global Excellence Award</span>
              <span className="text-sm font-bold text-gray-900">24 Jul</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#FBECC8]/60 border-b-0">
              <span className="text-sm font-medium text-gray-800">International Merit Grant</span>
              <span className="text-sm font-bold text-gray-900">02 Aug</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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
