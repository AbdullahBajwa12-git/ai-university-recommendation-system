import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, MapPin, DollarSign, Star, Info, ExternalLink,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { cn } from '../../utils/cn';

const recommendations = [
  {
    id: '1',
    rank: 1,
    school: 'Stanford University',
    program: 'M.S. in Computer Science (AI Track)',
    country: 'USA',
    fee: '$56,000',
    probability: 42,
    category: 'REACH',
    explanation: 'Your GRE score is in the top 5% of admitted students. However, the acceptance rate for this program is extremely low at 4%.',
  },
  {
    id: '2',
    rank: 2,
    school: 'University of Toronto',
    program: 'Master of Applied Science in Software Engineering',
    country: 'Canada',
    fee: '$34,000',
    probability: 78,
    category: 'MODERATE',
    explanation: 'Your academic background precisely aligns with Toronto\'s prerequisite requirements. Strong match for core courses.',
  },
  {
    id: '3',
    rank: 3,
    school: 'TU Munich',
    program: 'M.Sc. Informatics',
    country: 'Germany',
    fee: '$0 (Public)',
    probability: 91,
    category: 'SAFE',
    explanation: 'Perfect match. Your CGPA exceeds the minimum threshold and your research interests align with their faculty.',
  },
];

const categoryStyles = {
  SAFE: { bar: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', text: 'text-emerald-500', badge: 'bg-emerald-500' },
  MODERATE: { bar: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', text: 'text-amber-500', badge: 'bg-amber-500' },
  REACH: { bar: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', text: 'text-red-500', badge: 'bg-red-500' },
};

const Recommendations = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            AI Recommendations
            <Sparkles className="h-6 w-6 text-blue-500 animate-pulse" />
          </h2>
          <p className="text-gray-500 mt-1">Personalized programs based on your academic profile.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Modify Preferences</Button>
          <Button size="sm">Regenerate List</Button>
        </div>
      </div>

      <div className="space-y-6">
        {recommendations.map((rec) => {
          const styles = categoryStyles[rec.category];
          return (
            <div
              key={rec.id}
              className="group bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Probability panel */}
                <div className={cn('w-full lg:w-44 p-8 flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-700 space-y-2', styles.bar)}>
                  <div className="text-xs font-bold text-gray-400 uppercase">Rank #{rec.rank}</div>
                  <div className={cn('text-5xl font-black', styles.text)}>{rec.probability}%</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Chance</div>
                  <span className={cn('mt-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-white', styles.badge)}>
                    {rec.category}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {rec.school}
                      </h3>
                      <p className="text-gray-500 mt-1">{rec.program}</p>
                      <div className="flex flex-wrap gap-3 mt-4">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                          <MapPin className="h-3 w-3" />{rec.country}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                          <DollarSign className="h-3 w-3" />{rec.fee} / Year
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                          <Star className="h-3 w-3" />QS Top 50
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-full">Save</Button>
                      <Button size="sm" className="rounded-full gap-2">
                        Apply <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* AI Explanation */}
                  <div className="mt-6 p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 relative">
                    <div className="absolute top-[-12px] left-5 px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-600 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" />AI Insight
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 italic">"{rec.explanation}"</p>
                    <div className="mt-3 flex gap-4">
                      <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                        <Info className="h-3 w-3" /> View Requirements
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Recommendations;
