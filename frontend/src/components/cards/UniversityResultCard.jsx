import React, { useState } from 'react';
import {
  Globe, Sparkles, Trophy, ExternalLink, Mail,
  MapPin, Bookmark, BookmarkCheck,
  CalendarClock, X, ChevronRight, Wallet, Target, Map
} from 'lucide-react';
import { cn } from '../../utils/cn';

/* ── Helpers ──────────────────────────────────────────────────────────────── */

/** Extract root domain from any URL string, used for Clearbit logo API */
const getDomain = (url) => {
  try {
    const u = new URL(url?.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

/** Map well-known university names to their correct logo domains as a fallback */
const KNOWN_LOGO_DOMAINS = {
  'university of toronto': 'utoronto.ca',
  'mit': 'mit.edu',
  'massachusetts institute of technology': 'mit.edu',
  'harvard university': 'harvard.edu',
  'stanford university': 'stanford.edu',
  'university of oxford': 'ox.ac.uk',
  'university of cambridge': 'cam.ac.uk',
  'columbia university': 'columbia.edu',
  'yale university': 'yale.edu',
  'princeton university': 'princeton.edu',
  'university of michigan': 'umich.edu',
  'university of waterloo': 'uwaterloo.ca',
  'mcgill university': 'mcgill.ca',
  'ubc': 'ubc.ca',
  'university of british columbia': 'ubc.ca',
  'eth zurich': 'ethz.ch',
  'national university of singapore': 'nus.edu.sg',
  'peking university': 'pku.edu.cn',
  'tsinghua university': 'tsinghua.edu.cn',
  'university of melbourne': 'unimelb.edu.au',
};

const getLogoDomain = (name, website) => {
  // First try to get from website URL
  const fromUrl = getDomain(website);
  if (fromUrl && fromUrl !== 'google.com' && fromUrl !== 'www.google.com') {
    return fromUrl;
  }
  // Fallback: look up by university name
  const key = (name || '').toLowerCase().trim();
  return KNOWN_LOGO_DOMAINS[key] || null;
};

/* ── Sub-components ──────────────────────────────────────────────────────── */

/** University logo: tries Clearbit, falls back to initials */
const UniversityLogo = ({ name, website }) => {
  const [imgError, setImgError] = useState(false);
  const domain = getLogoDomain(name, website);
  const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : null;

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  if (logoUrl && !imgError) {
    return (
      <div className="h-16 w-16 rounded-2xl bg-white border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform shrink-0">
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="w-12 h-12 object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xl font-black text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shrink-0 shadow-sm">
      {initials}
    </div>
  );
};

/** Full "Why this matches you" detail modal */
const MatchDetailModal = ({ isOpen, onClose, university }) => {
  if (!isOpen) return null;
  const {
    university_name,
    country,
    reason_for_match,
    admission_chance,
    world_rank,
    major,
    degree,
    description,
    university_website,
  } = university;

  const getChanceLabel = (c) => {
    if (c >= 80) return { text: 'Very High – Safe Choice', color: 'text-emerald-600 bg-emerald-50', bar: 'bg-emerald-500' };
    if (c >= 50) return { text: 'Moderate – Target School', color: 'text-yellow-600 bg-yellow-50', bar: 'bg-yellow-500' };
    if (c >= 30) return { text: 'Challenging – Reach School', color: 'text-orange-600 bg-orange-50', bar: 'bg-orange-500' };
    return { text: 'Highly Competitive – Stretch Goal', color: 'text-red-600 bg-red-50', bar: 'bg-red-500' };
  };

  const chance = getChanceLabel(admission_chance);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 px-8 pt-8 pb-6 border-b border-dashed border-emerald-200/60 dark:border-emerald-800/40">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <UniversityLogo name={university_name} website={university_website} />
              <div>
                <h2 className="text-xl font-black leading-tight">{university_name}</h2>
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {country}
                  {world_rank && <span className="ml-2 text-amber-600 font-bold flex items-center gap-0.5"><Trophy className="h-3 w-3" /> QS #{world_rank}</span>}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* Admission Chance */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Your Admission Chance</p>
            <div className="flex items-center gap-3 mb-2">
              <span className={cn("text-3xl font-black", chance.bar.replace('bg-', 'text-'))}>{admission_chance}%</span>
              <span className={cn("text-xs font-bold px-3 py-1 rounded-full", chance.color)}>{chance.text}</span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={cn("h-full transition-all duration-700", chance.bar)} style={{ width: `${admission_chance}%` }} />
            </div>
          </div>

          {/* Why this matches — detailed */}
          <div className="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl p-5 border border-dashed border-emerald-500/25">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Why This University Matches You</p>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {reason_for_match || 'This university was selected based on your academic profile, target major, and preferences.'}
            </p>
          </div>

          {/* Program Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Degree</p>
              <p className="font-bold text-sm">{degree || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Major</p>
              <p className="font-bold text-sm">{major || 'N/A'}</p>
            </div>
          </div>

          {/* Deadline */}
          {description && (
            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4">
              <CalendarClock className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-0.5">Application Deadline</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{description}</p>
              </div>
            </div>
          )}

          {/* Tips based on match */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">How to Strengthen Your Application</p>
            <ul className="space-y-2">
              {[
                admission_chance < 50 && 'Focus on a compelling Statement of Purpose that highlights your research interest.',
                admission_chance < 70 && 'Reach out to professors whose research aligns with your intended major.',
                'Ensure your transcripts and test scores are officially submitted well before the deadline.',
                'Request strong letters of recommendation from academic or professional supervisors.',
              ].filter(Boolean).map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ChevronRight className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 bg-gray-50 dark:bg-gray-800/50">
          <a
            href={university_website || `https://www.google.com/search?q=${encodeURIComponent(university_name + ' official site')}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 text-sm font-bold hover:bg-primary hover:text-white transition-all border border-gray-200 dark:border-gray-700"
          >
            <ExternalLink className="h-4 w-4" /> Visit Website
          </a>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Card ───────────────────────────────────────────────────────────── */

const UniversityResultCard = ({
  university,
  onSave,
  onUnsave,
  isSaved,
  isBookmarkPending,
  showCompare,
  onCompareToggle,
  isComparing
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
    reason_for_match,
    city,
    category,
    course_page_url,
    tuition_fee,
    acceptance_rate,
    deadline
  } = university;

  const [isReasonExpanded, setIsReasonExpanded] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const isValidUrl = (url) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const handleCopyEmail = () => {
    if (university_email) {
      navigator.clipboard.writeText(university_email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

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

  return (
    <>
      <div className="group relative bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden flex flex-col h-full">

        {/* Header with Stats */}
        <div className="p-8 pb-4">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4">
              {/* ── University Logo (Clearbit + fallback initials) ── */}
              <UniversityLogo name={university_name} website={university_website} />

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {city ? `${city}, ${country}` : country}
                  </span>
                  {category && (
                    <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                      category.toUpperCase() === 'SAFE' ? 'text-emerald-600 bg-emerald-500/10' :
                        category.toUpperCase() === 'TARGET' ? 'text-yellow-600 bg-yellow-500/10' :
                          category.toUpperCase() === 'REACH' ? 'text-orange-600 bg-orange-500/10' :
                            'text-gray-600 bg-gray-500/10'
                    )}>
                      {category}
                    </span>
                  )}
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
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  isSaved ? onUnsave() : onSave();
                }}
                disabled={isBookmarkPending}
                aria-pressed={isSaved}
                aria-label={
                  isBookmarkPending
                    ? (isSaved ? "Removing from saved..." : "Saving university...")
                    : (isSaved ? "Remove university from saved" : "Save university")
                }
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center transition-all border outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isSaved
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-400 hover:text-primary hover:border-primary",
                  isBookmarkPending && "opacity-50 cursor-not-allowed"
                )}
              >
                {isBookmarkPending ? (
                  <div className={cn(
                      "h-5 w-5 border-2 border-t-transparent rounded-full animate-spin",
                      isSaved ? "border-white" : "border-primary"
                  )} />
                ) : isSaved ? (
                  <BookmarkCheck className="h-5 w-5" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </button>
              {showCompare && (
                <button
                  disabled
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center transition-all border",
                    isComparing
                      ? "bg-primary border-primary text-white"
                      : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-300 opacity-50 cursor-not-allowed"
                  )}
                  title="Compare feature coming soon"
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

        {/* ── Stats Grid ── */}
        <div className="px-8 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5 flex items-center gap-1"><Wallet className="h-3 w-3" /> Tuition Fee</p>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
              {tuition_fee ? `$${tuition_fee.toLocaleString()}/yr` : 'Not available'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5 flex items-center gap-1"><Target className="h-3 w-3" /> Acceptance</p>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
              {acceptance_rate ? `${acceptance_rate}%` : 'Not available'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5 flex items-center gap-1"><CalendarClock className="h-3 w-3" /> Deadline</p>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate" title={deadline || 'Verify on official website'}>
              {deadline || 'Verify on official website'}
            </p>
          </div>
        </div>

        {/* ── Matching Badge & Reason ── */}
        <div className="px-8 py-4 bg-emerald-500/5 dark:bg-emerald-500/10 border-y border-dashed border-emerald-500/20">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5 flex justify-between items-center">
                <span>The Matching Score Reason</span>
                {scholarship_available && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Scholarship Match</span>}
              </p>
              <p className={cn("text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed", !isReasonExpanded && "line-clamp-2")}>
                {reason_for_match || 'This university was selected based on your academic profile and preferences.'}
              </p>
              <button
                onClick={() => setIsReasonExpanded(!isReasonExpanded)}
                className="mt-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 flex items-center gap-0.5 transition-colors"
              >
                {isReasonExpanded ? 'Show less' : 'Read more'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="p-6 flex-1 flex flex-col bg-gray-50/30 dark:bg-gray-800/10">
          <div className="mt-auto flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {isValidUrl(course_page_url) && (
                <a
                  href={course_page_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm whitespace-nowrap min-w-[120px]"
                >
                  <GraduationCap className="h-4 w-4 shrink-0" /> Course / Admissions
                </a>
              )}

              {isValidUrl(university_website) && (
                <a
                  href={university_website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all whitespace-nowrap min-w-[100px]"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" /> Website
                </a>
              )}

              {university_email && (
                <button
                  onClick={handleCopyEmail}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all whitespace-nowrap min-w-[100px]"
                >
                  <Mail className="h-4 w-4 shrink-0" /> {emailCopied ? 'Copied' : 'Copy Email'}
                </button>
              )}
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(university_name + (city ? ` ${city}` : '') + ` ${country}`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <Map className="h-4 w-4 text-emerald-500 shrink-0" /> View on Map
            </a>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <MatchDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        university={university}
      />
    </>
  );
};

// Re-using defined icons for standalone
const GraduationCap = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>;
const BrainCircuit = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5V12" /><path d="m8 8 3 3" /><path d="M20 11a8.1 8.1 0 0 0-15.5-2" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2" /><circle cx="12" cy="12" r="2" /><path d="M12 12h5" /><circle cx="18" cy="12" r="1" /><path d="m15 15 2 2" /><circle cx="18" cy="18" r="1" /><path d="m12 15-1 1" /><circle cx="10" cy="18" r="1" /><path d="m8 12-2 1" /><circle cx="5" cy="14" r="1" /><path d="m9 9-2.5-1" /><circle cx="5" cy="7" r="1" /><circle cx="12" cy="4" r="1" /></svg>;

export default UniversityResultCard;
