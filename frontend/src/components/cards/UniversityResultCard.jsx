import React from 'react';
import { 
  Globe, Sparkles, Trophy, ExternalLink, Mail, 
  MapPin, CheckCircle, Bookmark, BookmarkCheck,
  TrendingDown, TrendingUp
} from 'lucide-react';
import { cn } from '../../utils/cn';

const UniversityResultCard = ({ 
  university, 
  onSave, 
  onUnsave, 
  isSaved, 
  isSaving,
  showCompare,
  onCompareToggle,
  isComparing
}) => {
  const {
    university_name,
    country,
    degree,
    major,
    admission_chance,
    world_rank,
    scholarship_available,
    university_email,
    university_website,
    description,
    reason_for_match
  } = university;

  // Chance color logic
  const getChanceColor = (chance) => {
    if (chance >= 80) return 'bg-emerald-500';
    if (chance >= 50) return 'bg-yellow-500';
    if (chance >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getChanceText = (chance) => {
    if (chance >= 80) return 'Very High (Safe)';
    if (chance >= 50) return 'Moderate (Target)';
    if (chance >= 30) return 'Challenging (Reach)';
    return 'Highly Competitive';
  };

  const getInitialAvatar = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden flex flex-col h-full">
      
      {/* Header with Stats */}
      <div className="p-8 pb-4">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-2xl font-black text-gray-500 dark:text-gray-400 group-hover:scale-110 transition-transform">
              {getInitialAvatar(university_name)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {country}
                </span>
                {world_rank && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Trophy className="h-3 w-3" /> QS Rank #{world_rank}
                  </span>
                )}
              </div>
              <h4 className="text-xl font-bold leading-tight line-clamp-2 pr-6">{university_name}</h4>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => isSaved ? onUnsave() : onSave()}
              disabled={isSaving}
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center transition-all border",
                isSaved 
                  ? "bg-emerald-500 border-emerald-500 text-white" 
                  : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-400 hover:text-primary hover:border-primary"
              )}
            >
              {isSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
            </button>
            {showCompare && (
               <button 
                onClick={onCompareToggle}
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center transition-all border",
                  isComparing 
                    ? "bg-primary border-primary text-white" 
                    : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-400 hover:text-primary hover:border-primary"
                )}
              >
                <div className="text-[10px] font-black">VS</div>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" /> {degree}
            </div>
            <div className="h-1 w-1 rounded-full bg-gray-300" />
            <div className="flex items-center gap-1.5 truncate max-w-[150px]">
              <BrainCircuit className="h-4 w-4" /> {major}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-sm font-black uppercase tracking-wider text-gray-400">Admission Chance</span>
              <span className={cn("text-lg font-black", getChanceColor(admission_chance).replace('bg-', 'text-'))}>
                {admission_chance}%
              </span>
            </div>
            <div className="group/bar h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
              <div 
                className={cn("h-full transition-all duration-1000 ease-out", getChanceColor(admission_chance))}
                style={{ width: `${admission_chance}%` }}
              />
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-[8px] font-bold text-white uppercase">{getChanceText(admission_chance)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matching Badge */}
      <div className="px-8 py-4 bg-emerald-500/5 dark:bg-emerald-500/10 border-y border-dashed border-emerald-500/20">
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">The Matching Score Reason</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed line-clamp-2">
              "{reason_for_match}"
            </p>
          </div>
        </div>
      </div>

      {/* Description & Links */}
      <div className="p-8 pt-6 flex-1 flex flex-col">
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3">
          {description}
        </p>

        <div className="mt-auto grid grid-cols-2 gap-3">
          {university_website && (
            <a 
              href={university_website} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm font-bold hover:bg-primary hover:text-white transition-all border border-gray-100 dark:border-gray-700"
            >
              <ExternalLink className="h-4 w-4" /> Website
            </a>
          )}
          {university_email && (
            <a 
              href={`mailto:${university_email}`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm font-bold hover:bg-primary hover:text-white transition-all border border-gray-100 dark:border-gray-700"
            >
              <Mail className="h-4 w-4" /> Admissions
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// Re-using defined icons for standalone
const GraduationCap = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const BrainCircuit = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5V12"/><path d="m8 8 3 3"/><path d="M20 11a8.1 8.1 0 0 0-15.5-2"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2"/><circle cx="12" cy="12" r="2"/><path d="M12 12h5"/><circle cx="18" cy="12" r="1"/><path d="m15 15 2 2"/><circle cx="18" cy="18" r="1"/><path d="m12 15-1 1"/><circle cx="10" cy="18" r="1"/><path d="m8 12-2 1"/><circle cx="5" cy="14" r="1"/><path d="m9 9-2.5-1"/><circle cx="5" cy="7" r="1"/><circle cx="12" cy="4" r="1"/></svg>;

export default UniversityResultCard;
