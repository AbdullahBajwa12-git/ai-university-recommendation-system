import React, { useState } from 'react';
import {
  Globe, Sparkles, Trophy, ExternalLink, Mail,
  MapPin, Bookmark, BookmarkCheck,
  CalendarClock, X, ChevronRight, Wallet, Target,
  GraduationCap, Brain, Check
} from 'lucide-react';
import { cn } from '../../utils/cn';

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const getDomain = (url) => {
  try {
    const u = new URL(url?.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

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
  const fromUrl = getDomain(website);
  if (fromUrl && fromUrl !== 'google.com') return fromUrl;
  const key = (name || '').toLowerCase().trim();
  return KNOWN_LOGO_DOMAINS[key] || null;
};

/* ─── Chance config ──────────────────────────────────────────────────────── */

const getChanceCfg = (c) => {
  if (c >= 80) return {
    label: 'Safe Choice', short: 'Safe',
    ring: 'text-emerald-500', bg: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    glow: 'shadow-emerald-500/20',
    barGrad: 'from-emerald-400 to-teal-400',
  };
  if (c >= 50) return {
    label: 'Target School', short: 'Target',
    ring: 'text-amber-500', bg: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    glow: 'shadow-amber-500/20',
    barGrad: 'from-amber-400 to-yellow-400',
  };
  if (c >= 30) return {
    label: 'Reach School', short: 'Reach',
    ring: 'text-orange-500', bg: 'bg-orange-500',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    glow: 'shadow-orange-500/20',
    barGrad: 'from-orange-400 to-red-400',
  };
  return {
    label: 'Stretch Goal', short: 'Stretch',
    ring: 'text-red-500', bg: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border-red-200',
    glow: 'shadow-red-500/20',
    barGrad: 'from-red-400 to-rose-400',
  };
};

/* category accent colours */
const CAT_ACCENT = {
  SAFE:   { top: 'from-emerald-400 to-teal-400',   hero: 'from-emerald-50/80 to-teal-50/40' },
  TARGET: { top: 'from-amber-400 to-yellow-400',   hero: 'from-amber-50/80 to-yellow-50/40' },
  REACH:  { top: 'from-orange-400 to-red-400',     hero: 'from-orange-50/80 to-red-50/30'   },
  DEFAULT:{ top: 'from-blue-400 to-indigo-400',    hero: 'from-blue-50/80 to-indigo-50/40'  },
};

/* ─── University Logo ────────────────────────────────────────────────────── */

const UniversityLogo = ({ name, website, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const domain = getLogoDomain(name, website);
  const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : null;
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';

  const sizes = {
    sm: 'h-11 w-11 rounded-xl text-sm',
    md: 'h-14 w-14 rounded-2xl text-base',
    lg: 'h-16 w-16 rounded-2xl text-lg',
  };

  const colors = [
    'from-blue-500 to-indigo-600 text-white',
    'from-emerald-500 to-teal-600 text-white',
    'from-violet-500 to-purple-600 text-white',
    'from-amber-500 to-orange-600 text-white',
    'from-rose-500 to-pink-600 text-white',
  ];
  const colorIndex = (name?.charCodeAt(0) || 0) % colors.length;

  if (logoUrl && !imgError) {
    return (
      <div className={cn(sizes[size], 'bg-white border-2 border-white shadow-lg flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-gray-100')}>
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="w-full h-full object-contain p-1.5"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className={cn(sizes[size], 'bg-gradient-to-br flex items-center justify-center font-black shrink-0 shadow-lg border-2 border-white ring-2 ring-gray-100', colors[colorIndex])}>
      {initials}
    </div>
  );
};

/* ─── Circular progress arc ─────────────────────────────────────────────── */

const CircleProgress = ({ value, cfg }) => {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
      <svg className="rotate-[-90deg] absolute inset-0" width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#f1f5f9" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          strokeWidth="5" strokeLinecap="round"
          stroke="currentColor"
          className={cfg.ring}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />
      </svg>
      <span className={cn('text-[13px] font-black z-10', cfg.ring)}>{value}%</span>
    </div>
  );
};

/* ─── Stat Item ──────────────────────────────────────────────────────────── */

const Stat = ({ icon: Icon, label, value, iconCls = 'text-gray-400' }) => (
  <div className="flex flex-col gap-0.5 min-w-0">
    <div className={cn('flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gray-400')}>
      <Icon className={cn('h-3 w-3 shrink-0', iconCls)} /> {label}
    </div>
    <p className="text-xs font-bold text-gray-800 truncate">{value || <span className="text-gray-300 font-medium">—</span>}</p>
  </div>
);

/* ─── Detail Modal ───────────────────────────────────────────────────────── */

const MatchDetailModal = ({ isOpen, onClose, university }) => {
  if (!isOpen) return null;
  const {
    university_name, country, reason_for_match, admission_chance,
    world_rank, major, degree, description, university_website,
    tuition_fee, acceptance_rate, deadline, scholarship_available,
  } = university;
  const cfg = getChanceCfg(admission_chance);

  return (
    <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-xl rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 flex flex-col max-h-[92vh]">

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-5 border-b border-gray-100 bg-gradient-to-br from-slate-50 to-white shrink-0">
          <div className="flex items-start gap-3 justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <UniversityLogo name={university_name} website={university_website} size="md" />
              <div className="min-w-0">
                <h2 className="text-base font-black text-gray-900 leading-tight line-clamp-2">{university_name}</h2>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" /> {country}
                  {world_rank && <span className="ml-1.5 text-amber-600 font-bold flex items-center gap-0.5"><Trophy className="h-3 w-3" />#{world_rank}</span>}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Admission Chance */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Your Admission Chance</p>
            <div className="flex items-center gap-4">
              <CircleProgress value={admission_chance} cfg={cfg} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn('text-2xl font-black', cfg.ring)}>{admission_chance}%</span>
                  <span className={cn('text-xs font-bold px-2.5 py-0.5 rounded-full border', cfg.badge)}>{cfg.label}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all duration-1000', cfg.bg)} style={{ width: `${admission_chance}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Why this matches */}
          <div className="bg-emerald-50/60 rounded-2xl p-4 border border-dashed border-emerald-200">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Why This University Matches You</p>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {reason_for_match || 'Selected based on your academic profile, target major, and preferences.'}
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Degree', value: degree },
              { label: 'Major', value: major },
              { label: 'Tuition', value: tuition_fee ? `$${Number(tuition_fee).toLocaleString()}/yr` : null },
              { label: 'Acceptance Rate', value: acceptance_rate ? `${acceptance_rate}%` : null },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                <p className="font-bold text-sm text-gray-800">{value || <span className="text-gray-300">N/A</span>}</p>
              </div>
            ))}
          </div>

          {/* Deadline */}
          {deadline && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <CalendarClock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-0.5">Application Deadline</p>
                <p className="text-sm font-bold text-gray-800">{deadline}</p>
              </div>
            </div>
          )}

          {/* Scholarship */}
          {scholarship_available && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="h-3 w-3 text-emerald-600" />
              </div>
              <span className="text-sm font-bold text-emerald-800">Scholarship opportunities available</span>
            </div>
          )}

          {/* Tips */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">How to Strengthen Your Application</p>
            <ul className="space-y-2">
              {[
                admission_chance < 50 && 'Craft a compelling Statement of Purpose that highlights your research intent.',
                admission_chance < 70 && 'Connect with professors whose research aligns with your intended major.',
                'Ensure all transcripts and test scores are officially submitted well before deadline.',
                'Request strong letters of recommendation from academic supervisors.',
              ].filter(Boolean).map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <ChevronRight className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex gap-3 shrink-0">
          <a
            href={university_website || `https://www.google.com/search?q=${encodeURIComponent(university_name + ' official site')}`}
            target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <ExternalLink className="h-4 w-4" /> Visit Website
          </a>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN CARD ──────────────────────────────────────────────────────────── */

const UniversityResultCard = ({
  university,
  onSave, onUnsave,
  isSaved, isBookmarkPending,
  showCompare, onCompareToggle, isComparing
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReasonExpanded, setIsReasonExpanded] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const {
    university_name, country, degree, major,
    admission_chance, world_rank, scholarship_available,
    university_email, university_website,
    reason_for_match, city, category,
    course_page_url, tuition_fee, acceptance_rate, deadline,
  } = university;

  const cfg = getChanceCfg(admission_chance);
  const catKey = (category?.toUpperCase()) in CAT_ACCENT ? category.toUpperCase() : 'DEFAULT';
  const accent = CAT_ACCENT[catKey];

  const isValidUrl = (url) => url && (url.startsWith('http://') || url.startsWith('https://'));

  const handleCopyEmail = () => {
    if (university_email) {
      navigator.clipboard.writeText(university_email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  /* category badge color */
  const catCfg = {
    SAFE:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    TARGET: 'bg-amber-50 text-amber-700 border-amber-200',
    REACH:  'bg-orange-50 text-orange-700 border-orange-200',
  };
  const catClass = catCfg[category?.toUpperCase()] || 'bg-gray-50 text-gray-600 border-gray-200';

  return (
    <>
      <div className={cn(
        'group relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col',
        'shadow-sm hover:shadow-xl hover:shadow-gray-200/80 dark:hover:shadow-gray-900/80 hover:-translate-y-1',
        'transition-all duration-300 ease-out h-full'
      )}>

        {/* ── HERO BANNER (top coloured section with logo overlay) ── */}
        <div className={cn(
          'relative h-24 bg-gradient-to-br shrink-0',
          accent.hero
        )}>
          {/* Top accent stripe */}
          <div className={cn('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r', accent.top)} />

          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '20px 20px' }} />

          {/* Rank badge — top right */}
          {world_rank && (
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-amber-200 px-2.5 py-1 rounded-full shadow-sm">
              <Trophy className="h-3 w-3 text-amber-500 shrink-0" />
              <span className="text-[10px] font-black text-amber-700">QS #{world_rank}</span>
            </div>
          )}

          {/* Logo — bottom of banner, overlapping body */}
          <div className="absolute -bottom-7 left-5">
            <UniversityLogo name={university_name} website={university_website} size="lg" />
          </div>
        </div>

        {/* ── HEADER BODY ── */}
        <div className="pt-10 px-5 sm:px-6 pb-3">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
              <MapPin className="h-2.5 w-2.5" />
              {city ? `${city}, ${country}` : country}
            </span>
            {category && (
              <span className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border', catClass)}>
                {category}
              </span>
            )}
            {scholarship_available && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                <Check className="h-2.5 w-2.5" /> Scholarship
              </span>
            )}
          </div>

          {/* University name + save button */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-300 flex-1">
              {university_name}
            </h3>
            {/* Save button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); isSaved ? onUnsave() : onSave(); }}
              disabled={isBookmarkPending}
              aria-pressed={isSaved}
              aria-label={isSaved ? 'Remove from saved' : 'Save university'}
              className={cn(
                'h-9 w-9 rounded-full flex items-center justify-center transition-all border outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shrink-0',
                isSaved
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50',
                isBookmarkPending && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isBookmarkPending ? (
                <div className={cn('h-4 w-4 border-2 border-t-transparent rounded-full animate-spin', isSaved ? 'border-white' : 'border-blue-600')} />
              ) : isSaved ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Degree • Major */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1.5 flex-wrap">
            <GraduationCap className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="font-semibold">{degree}</span>
            <span className="text-gray-300">·</span>
            <Brain className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="font-semibold truncate max-w-[140px]">{major}</span>
          </p>
        </div>

        {/* ── ADMISSION CHANCE BAR ── */}
        <div className="px-5 sm:px-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Admission Chance</span>
            <div className="flex items-center gap-2">
              <span className={cn('text-xs font-black', cfg.ring)}>{admission_chance}%</span>
              <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full border', cfg.badge)}>{cfg.short}</span>
            </div>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out', cfg.barGrad)}
              style={{ width: `${admission_chance}%` }}
            />
          </div>
        </div>

        {/* ── STATS STRIP ── */}
        <div className="mx-5 sm:mx-6 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 p-3.5 grid grid-cols-3 gap-3 mb-4">
          <Stat icon={Wallet} label="Tuition" value={tuition_fee ? `$${Number(tuition_fee).toLocaleString()}/yr` : null} iconCls="text-blue-400" />
          <Stat icon={Target} label="Acceptance" value={acceptance_rate ? `${acceptance_rate}%` : null} iconCls="text-purple-400" />
          <Stat icon={CalendarClock} label="Deadline" value={deadline} iconCls="text-amber-400" />
        </div>

        {/* ── AI MATCH REASON ── */}
        <div className="mx-5 sm:mx-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/30 dark:from-emerald-900/20 dark:to-teal-900/10 border border-dashed border-emerald-200 dark:border-emerald-800/50 p-4 mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Why You Match</span>
            {scholarship_available && (
              <span className="ml-auto text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">Scholarship</span>
            )}
          </div>
          <p className={cn('text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic', !isReasonExpanded && 'line-clamp-2')}>
            {reason_for_match || 'Selected based on your academic profile, target major, and study preferences.'}
          </p>
          <button
            onClick={() => setIsReasonExpanded(!isReasonExpanded)}
            className="mt-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 underline underline-offset-2 transition-colors"
          >
            {isReasonExpanded ? 'Show less ↑' : 'Read more ↓'}
          </button>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="px-5 sm:px-6 pb-5 mt-auto flex flex-col gap-2.5">

          {/* Primary row */}
          <div className="flex gap-2">
            {isValidUrl(course_page_url) && (
              <a
                href={course_page_url} target="_blank" rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm shadow-blue-500/20"
              >
                <GraduationCap className="h-3.5 w-3.5 shrink-0" /> Course &amp; Admissions
              </a>
            )}
            {isValidUrl(university_website) && (
              <a
                href={university_website} target="_blank" rel="noreferrer"
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                  isValidUrl(course_page_url) ? 'px-4' : 'flex-1'
                )}
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                {isValidUrl(course_page_url) ? <span className="hidden sm:inline">Website</span> : 'Visit Website'}
              </a>
            )}
          </div>

          {/* Secondary row */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsDetailOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-100 dark:border-blue-800/50 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" /> Full Match Details
            </button>

            {university_email && (
              <button
                onClick={handleCopyEmail}
                className={cn(
                  'flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border',
                  emailCopied
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                {emailCopied ? <Check className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{emailCopied ? 'Copied!' : 'Email'}</span>
              </button>
            )}

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(university_name + (city ? ` ${city}` : '') + ` ${country}`)}`}
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all"
              title="View on Map"
            >
              <Globe className="h-3.5 w-3.5 text-blue-500" />
              <span className="hidden sm:inline">Map</span>
            </a>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <MatchDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} university={university} />
    </>
  );
};


export default UniversityResultCard;
