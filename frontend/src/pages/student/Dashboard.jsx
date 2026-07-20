import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
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
import profileService from '../../services/profileService';

const StatCard = ({ icon: Icon, number, title, subtext }) => (
  <div className="relative p-4 md:p-6 flex flex-row md:flex-col justify-between items-center md:items-start h-full hover:shadow-lg hover:-translate-y-0.5 transition-all gap-3 md:gap-0 rounded-2xl group">
    {/* Gradient Border */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-400 p-[2px] pointer-events-none z-0">
      <div className="w-full h-full bg-white dark:bg-gray-800 rounded-[14px]" />
    </div>

    <div className="relative z-10 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-700 md:mb-6 shrink-0">
      <Icon className="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-300" />
    </div>
    <div className="relative z-10 flex-1 md:flex-none">
      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-0.5">{number}</h3>
      <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-gray-200 mb-0.5">{title}</p>
      <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{subtext}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || 'Abdullah';

  const { saved, history } = useRecommendations();
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === 6 ? 1 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await profileService.getProfile();
        if (active && data) {
          const FORM_FIELDS = ['cgpa', 'ielts_score', 'gre_score', 'budget_max', 'preferred_study_level', 'degree', 'graduation_year', 'work_experience_months'];
          let filled = 0;
          FORM_FIELDS.forEach(f => {
            if (data[f] !== null && data[f] !== undefined && data[f] !== '') {
              filled++;
            }
          });
          const pct = Math.round((filled / FORM_FIELDS.length) * 100);
          setCompletionPercentage(pct);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { active = false; };
  }, []);

  const getProgressColor = (pct) => {
    if (pct < 33) return 'bg-red-500';
    if (pct < 66) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

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
    <div className="max-w-[1200px] mx-auto w-full p-4 sm:p-6 md:p-8 font-sans pb-20">

      {/* Animated Hero Slider Section */}
      <div className="relative rounded-3xl overflow-hidden mb-8 shadow-sm border border-gray-100/50 dark:border-gray-800">
        {/* Background Images */}
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <div
            key={num}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${currentSlide === num ? 'opacity-100' : 'opacity-0'
              }`}
            style={{ backgroundImage: `url('/images/slider/${num}.jpg')` }}
          />
        ))}
        {/* Dark Overlay for readability (Landing Page Style) */}
        <div className="absolute inset-0 bg-slate-900/60 z-0"></div>

        <div className="relative p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-6 mb-8 z-10 relative">
            <div>
              <p className="text-blue-400 font-bold text-xs tracking-widest uppercase mb-3">
                SUNDAY, 19 JULY
              </p>
              <h1 className="text-3xl md:text-[40px] leading-tight md:leading-none font-bold text-white mb-3 tracking-tight font-serif drop-shadow-sm">
                Good evening, {firstName}.
              </h1>
              <p className="text-gray-200 text-sm drop-shadow-sm">
                Your shortlist is taking shape. Continue from the next meaningful step.
              </p>
            </div>
            <Link
          to="/find-universities"
          className="bg-gradient-to-r from-blue-600 via-teal-500 to-blue-600 animate-gradient-shift text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-1 border-0 flex items-center justify-center gap-2 group transition-all whitespace-nowrap w-full md:w-auto"
        >
          Find my Universities <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
          </div>

          {/* Dynamic Activity Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
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
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">


        {/* Profile Strength */}
        <div className="lg:col-span-1 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-200 dark:border-red-800 p-5 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-[#2563EB] font-bold text-xs tracking-widest uppercase mb-4 md:mb-6">
              PROFILE STRENGTH
            </h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tighter">{completionPercentage}</span>
              <span className="text-xl md:text-2xl font-bold text-gray-400">%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full mb-4 md:mb-6 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(completionPercentage)}`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-xs md:text-sm text-gray-500 leading-relaxed mb-6 md:mb-8">
              Strong enough to generate meaningful matches. Adding test evidence can improve confidence.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/profile"
              className="w-full py-2.5 md:py-3 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors block text-center shadow-sm"
            >
              Update Profile
            </Link>
            <Link
              to="/search-history"
              className="w-full py-2.5 md:py-3 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors block text-center shadow-sm"
            >
              View Search History
            </Link>
          </div>
        </div>
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-5 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">Universities Found per Search</h3>
          <div style={{ width: '100%', height: 220 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, md: { fontSize: 12 } }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, md: { fontSize: 12 } }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(val) => [`${val} universities`, 'Found']}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <p className="text-xs md:text-sm">No searches yet.</p>
                <p className="text-[10px] md:text-xs mt-1">Run a search to see your match history here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Scholarship deadlines */}
        <div className="lg:col-span-1 bg-[#FFFDF5] rounded-3xl border border-[#FBECC8] p-5 md:p-8 shadow-sm flex flex-col">
          <span className="inline-block px-3 py-1 bg-[#FBECC8] text-amber-700 text-[10px] md:text-xs font-bold rounded-full mb-4 md:mb-6 w-fit">
            2 upcoming
          </span>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Scholarship deadlines</h3>

          <div className="space-y-3 md:space-y-4 flex-grow">
            <div className="flex justify-between items-center py-2 md:py-3 border-b border-[#FBECC8]/60">
              <span className="text-xs md:text-sm font-medium text-gray-800">Global Excellence Award</span>
              <span className="text-xs md:text-sm font-bold text-gray-900">24 Jul</span>
            </div>
            <div className="flex justify-between items-center py-2 md:py-3 border-b border-[#FBECC8]/60 border-b-0">
              <span className="text-xs md:text-sm font-medium text-gray-800">International Merit Grant</span>
              <span className="text-xs md:text-sm font-bold text-gray-900">02 Aug</span>
            </div>
          </div>
        </div>
      </div>



      {/* Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-6">
        <div className="p-5 md:p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <CheckCircle2 className="text-emerald-500 h-4 w-4 md:h-5 md:w-5" />
            <h4 className="font-bold text-sm md:text-base text-gray-800 dark:text-white">Safe Schools</h4>
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-3 md:mb-4">Admission probability &gt; 80%</p>
          <div className="flex justify-end items-end">
            <Link to="/find-universities" className="text-[10px] md:text-xs font-bold text-emerald-500 hover:underline">Find matches →</Link>
          </div>
        </div>

        <div className="p-5 md:p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <TrendingUp className="text-amber-500 h-4 w-4 md:h-5 md:w-5" />
            <h4 className="font-bold text-sm md:text-base text-gray-800 dark:text-white">Moderate Schools</h4>
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-3 md:mb-4">Probability between 50–80%</p>
          <div className="flex justify-end items-end">
            <Link to="/find-universities" className="text-[10px] md:text-xs font-bold text-amber-500 hover:underline">Find matches →</Link>
          </div>
        </div>

        <div className="p-5 md:p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <AlertCircle className="text-red-500 h-4 w-4 md:h-5 md:w-5" />
            <h4 className="font-bold text-sm md:text-base text-gray-800 dark:text-white">Reach Schools</h4>
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-3 md:mb-4">Probability &lt; 50%</p>
          <div className="flex justify-end items-end">
            <Link to="/find-universities" className="text-[10px] md:text-xs font-bold text-red-500 hover:underline">Find matches →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
