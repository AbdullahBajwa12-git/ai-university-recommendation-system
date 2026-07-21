import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import {
  X, Check, Search, ArrowLeft, ArrowRight, Sparkles, User, GraduationCap
} from 'lucide-react';
import Input from '../common/Input';
import { cn } from '../../utils/cn';
import { ALL_DESTINATIONS } from '../../constants/studyDestinations';
import studyrouteLogoDark from '../../assets/brand/studyroute-logo-dark.svg';

const STEPS = [
  { id: 1, title: 'Profile' },
  { id: 2, title: 'Academic' },
  { id: 3, title: 'Tests' },
  { id: 4, title: 'Destinations' },
  { id: 5, title: 'Budget' },
  { id: 6, title: 'Review' }
];

const COUNTRY_CODES = {
  "Albania": "al", "Andorra": "ad", "Austria": "at", "Belarus": "by", "Belgium": "be",
  "Bosnia and Herzegovina": "ba", "Bulgaria": "bg", "Croatia": "hr", "Cyprus": "cy",
  "Czech Republic": "cz", "Denmark": "dk", "Estonia": "ee", "Finland": "fi",
  "France": "fr", "Germany": "de", "Greece": "gr", "Hungary": "hu", "Iceland": "is",
  "Ireland": "ie", "Italy": "it", "Kosovo": "xk", "Latvia": "lv", "Liechtenstein": "li",
  "Lithuania": "lt", "Luxembourg": "lu", "Malta": "mt", "Moldova": "md", "Monaco": "mc",
  "Montenegro": "me", "Netherlands": "nl", "North Macedonia": "mk", "Norway": "no",
  "Poland": "pl", "Portugal": "pt", "Romania": "ro", "Russia": "ru", "San Marino": "sm",
  "Serbia": "rs", "Slovakia": "sk", "Slovenia": "si", "Spain": "es", "Sweden": "se",
  "Switzerland": "ch", "Ukraine": "ua", "United Kingdom": "gb", "Vatican City": "va",
  "USA": "us", "Canada": "ca", "Mexico": "mx", "Australia": "au", "New Zealand": "nz",
  "China": "cn", "Japan": "jp", "South Korea": "kr", "Singapore": "sg", "Malaysia": "my",
  "UAE": "ae", "Turkey": "tr", "Saudi Arabia": "sa", "Hong Kong": "hk",
  "South Africa": "za", "Egypt": "eg", "Morocco": "ma", "Ghana": "gh",
  "Kenya": "ke", "Brazil": "br", "Argentina": "ar", "Chile": "cl", "Colombia": "co",
  "United Arab Emirates": "ae", "Türkiye": "tr"
};

const getFlagUrl = (countryName) => {
  const code = COUNTRY_CODES[countryName];
  return code ? `/flags/${code}.svg` : null;
};

const STEP_CONTENT = {
  1: {
    stepLabel: 'STEP 1 OF 6 • PERSONAL DETAILS',
    heading: 'Tell us about yourself',
    subtext: 'We need some basic information to personalize your search experience.',
    whyTitle: 'Your profile is your baseline.',
    whyDesc: 'Universities consider your home country and current level to evaluate your eligibility.',
    whyPoints: ['Determine eligibility', 'Personalize recommendations', 'Filter irrelevant results']
  },
  2: {
    stepLabel: 'STEP 2 OF 6 • ACADEMIC DIRECTION',
    heading: 'What would you like to study next?',
    subtext: 'We use your target qualification and subject to retrieve relevant university and program records before ranking candidates.',
    whyTitle: 'Your subject changes more than the search label.',
    whyDesc: 'Program availability, academic prerequisites, tuition and entry evidence can differ within the same university.',
    whyPoints: ['Retrieve compatible programs', 'Check academic relationships', 'Rank fit and affordability']
  },
  3: {
    stepLabel: 'STEP 3 OF 6 • TEST SCORES',
    heading: 'What are your test scores?',
    subtext: 'Language and standardized tests are mandatory for many top universities. Leave blank if not applicable.',
    whyTitle: 'Scores unlock opportunities.',
    whyDesc: 'Many institutions have strict cut-offs for language and academic test scores.',
    whyPoints: ['Verify admission requirements', 'Identify scholarship eligibility', 'Ensure visa compliance']
  },
  4: {
    stepLabel: 'STEP 4 OF 6 • STUDY DESTINATIONS',
    heading: 'Where do you want to study?',
    subtext: <><span className="font-bold text-blue-600">Select up to 3</span> target study destinations.</>,
    whyTitle: 'Location shapes your experience.',
    whyDesc: 'Different countries offer varying post-study work rights, living costs, and cultural experiences.',
    whyPoints: ['Match post-graduation goals', 'Align with living cost budget', 'Consider visa success rates']
  },
  5: {
    stepLabel: 'STEP 5 OF 6 • BUDGET & FUNDING',
    heading: 'What is your budget?',
    subtext: 'Tell us about your financial plans so we can match you with affordable options and scholarships.',
    whyTitle: 'Financial fit is crucial.',
    whyDesc: 'We want to ensure the recommended universities are realistic for your financial situation.',
    whyPoints: ['Filter by tuition fees', 'Identify scholarship needs', 'Estimate total investment']
  },
  6: {
    stepLabel: 'FINAL STEP • REVIEW',
    heading: 'Confirm the profile behind your shortlist.',
    subtext: 'Review your details before StudyRoute searches, scores and explains the best available matches.',
    whyTitle: 'Almost there!',
    whyDesc: 'Our AI will process your criteria and find the best possible university matches.',
    whyPoints: ['Verify accuracy', 'Ensure completeness', 'Generate tailored results']
  }
};

const UniversityFinderModal = ({ isOpen, onClose, onSubmit, isLoading, initialData, prefillSource }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [countrySearch, setCountrySearch] = useState('');
  const [showAllCountries, setShowAllCountries] = useState(false);


  const defaultVals = {
    full_name: '',
    email: '',
    country: '',
    current_degree_level: '',
    current_university: '',
    cgpa: '',
    graduation_year: '',
    degree_applying_for: '',
    intended_major: '',
    ielts: '',
    toefl: '',
    gre: '',
    gmat: '',
    sat: '',
    continents: [],
    countries: [],
    avoid_countries: [],
    open_to_all_destinations: false,
    budget_mode: 'total',
    currency: 'USD',
    total_budget: '',
    budget_period: 'per_year',
    max_course_tuition_fee: '',
    max_application_fee: '',
    degree_completed: false,
    need_scholarship: false,
    fully_funded_required: false,
    partial_scholarship_accepted: true,
    public_only: false,
    private_allowed: true,
    research_focused: false,
    industry_focused: false,
    top_ranked_only: false,
    ...(initialData || {}),
  };

  const { register, handleSubmit, watch, setValue, reset, trigger, formState: { errors } } = useForm({
    defaultValues: defaultVals,
  });

  const [lastSource, setLastSource] = useState(null);

  React.useEffect(() => {
    if (isOpen) {
      if (prefillSource === 'history') {
        reset(defaultVals);
        setCurrentStep(1);
        setLastSource('history');
      } else {
        if (lastSource === 'history') {
          reset(defaultVals);
          setCurrentStep(1);
        } else if (initialData && lastSource === null) {
          reset(defaultVals);
        }
        setLastSource(prefillSource || 'new');
      }
    }
  }, [isOpen, prefillSource, initialData]); // eslint-disable-line

  if (!isOpen) return null;

  const nextStep = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) {
      fieldsToValidate = ['full_name', 'email', 'country', 'current_degree_level', 'cgpa'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['degree_applying_for', 'intended_major'];
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFormSubmit = (data) => {
    const payload = { ...data };

    payload.continents = [];

    if (payload.budget_mode === 'total' && payload.total_budget) {
      payload.budget_max = parseFloat(payload.total_budget);
    } else if (payload.budget_mode === 'detailed' && payload.max_course_tuition_fee) {
      payload.budget_max = parseFloat(payload.max_course_tuition_fee);
    }

    if (payload.open_to_all_destinations) {
      const preferred = initialData?.preferred_countries || [];
      const current = payload.countries || [];
      payload.countries = [...new Set([...current, ...preferred])];
    } else {
      payload.countries = payload.countries || [];
      if (payload.countries.length === 0) {
        payload.countries = ALL_DESTINATIONS;
      }
    }

    delete payload.avoid_countries;
    delete payload.open_to_all_destinations;
    delete payload.budget_mode;
    delete payload.currency;
    delete payload.total_budget;
    delete payload.budget_period;
    delete payload.max_course_tuition_fee;
    delete payload.max_application_fee;

    ['cgpa', 'graduation_year', 'ielts', 'toefl', 'gre', 'gmat', 'sat'].forEach(k => {
      if (payload[k] !== undefined && payload[k] !== null && payload[k] !== '') {
        payload[k] = parseFloat(payload[k]);
      } else {
        delete payload[k];
      }
    });

    payload.year_gap = 0;
    payload.num_publications = 0;
    payload.num_research_papers = 0;
    payload.research_experience = "No";
    payload.work_experience = "No";

    payload.public_only = false;
    payload.research_focused = false;
    payload.industry_focused = false;
    payload.top_ranked_only = false;

    onSubmit(payload);
  };


  const watchCountries = watch('countries') || [];

  const toggleItem = (field, value) => {
    const current = watch(field) || [];
    if (current.includes(value)) {
      setValue(field, current.filter(item => item !== value));
    } else {
      if (field === 'countries' && current.length >= 3) {
        return;
      }
      setValue(field, [...current, value]);
    }
  };

  /* ── Shared select class ── */
  const selectCls = "w-full h-10 lg:h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none transition-all appearance-none cursor-pointer shadow-sm hover:border-blue-300 dark:hover:border-blue-500";

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

            {/* ── Personal Info ── */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-sm shadow-blue-500/30 shrink-0">
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Personal Info</span>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-100 to-transparent dark:from-blue-900/30" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />Full Name <span className="text-blue-500 ml-0.5">*</span>
                  </label>
                  <Input {...register('full_name', { required: 'Name is required' })} placeholder="Enter your full name" autoComplete="name" className="h-11" />
                  {errors.full_name && <span className="text-[10px] text-red-500 flex items-center gap-1">⚠ {errors.full_name.message}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />Email <span className="text-blue-500 ml-0.5">*</span>
                  </label>
                  <Input {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
                  })} type="email" placeholder="email@example.com" autoComplete="email" className="h-11" />
                  {errors.email && <span className="text-[10px] text-red-500 flex items-center gap-1">⚠ {errors.email.message}</span>}
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />Home Country <span className="text-blue-500 ml-0.5">*</span>
                  </label>
                  <Input {...register('country', { required: 'Country is required' })} placeholder="Your current country" autoComplete="country-name" className="h-11 max-w-sm" />
                  {errors.country && <span className="text-[10px] text-red-500 flex items-center gap-1">⚠ {errors.country.message}</span>}
                </div>
              </div>
            </div>

            {/* ── Academic Background ── */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-sm shadow-emerald-500/30 shrink-0">
                  <GraduationCap className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Academic Background</span>
                <div className="flex-1 h-px bg-gradient-to-r from-emerald-100 to-transparent dark:from-emerald-900/30" />
              </div>
              <div className="space-y-3">
                {/* Current Degree — Card Picker */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />Current Degree Level <span className="text-blue-500 ml-0.5">*</span>
                  </label>
                  {/* Hidden for RHF validation registration */}
                  <select className="sr-only" {...register('current_degree_level', { required: 'Degree level is required' })}>
                    <option value="" />
                    {['Bachelors', 'Masters', 'MPhil', 'PhD'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Bachelors', 'Masters', 'MPhil', 'PhD'].map(deg => {
                      const isActive = watch('current_degree_level') === deg;
                      return (
                        <button key={deg} type="button" onClick={() => setValue('current_degree_level', deg)}
                          className={cn(
                            'py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all duration-200 text-center',
                            isActive
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-md shadow-emerald-500/10'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50'
                          )}>
                          {deg}
                        </button>
                      );
                    })}
                  </div>
                  {errors.current_degree_level && <span className="text-[10px] text-red-500 flex items-center gap-1">⚠ {errors.current_degree_level.message}</span>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />Current University
                    </label>
                    <Input {...register('current_university')} placeholder="University Name" autoComplete="off" className="h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />Current CGPA <span className="text-blue-500 ml-0.5">*</span>
                    </label>
                    <Input {...register('cgpa', { required: 'CGPA is required' })} type="number" step="0.01" placeholder="e.g. 3.8" className="h-11" />
                    {errors.cgpa && <span className="text-[10px] text-red-500 flex items-center gap-1">⚠ {errors.cgpa.message}</span>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />Graduation Year
                    </label>
                    <Input {...register('graduation_year')} type="number" placeholder="e.g. 2025" className="h-11" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

            {/* Target Degree — Large Card Picker */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />Target Study Level <span className="text-blue-500 ml-0.5">*</span>
              </label>
              <select className="sr-only" {...register('degree_applying_for', { required: 'Target Study Level is required' })}>
                <option value="" />
                {['Bachelors', 'Masters', 'MPhil', 'PhD'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: 'Bachelors', icon: '🎓', desc: '3–4 year degree' },
                  { value: 'Masters',   icon: '🏅', desc: '1–2 year degree' },
                  { value: 'MPhil',     icon: '📚', desc: 'Research degree' },
                  { value: 'PhD',       icon: '🔬', desc: 'Doctoral study'  },
                ].map(({ value, icon, desc }) => {
                  const isActive = watch('degree_applying_for') === value;
                  return (
                    <button key={value} type="button" onClick={() => setValue('degree_applying_for', value)}
                      className={cn(
                        'flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 gap-1.5 text-center',
                        isActive
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md shadow-blue-500/15 -translate-y-0.5'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/30 hover:-translate-y-0.5'
                      )}>
                      <span className="text-2xl leading-none">{icon}</span>
                      <span className={cn('text-xs font-bold', isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300')}>{value}</span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">{desc}</span>
                    </button>
                  );
                })}
              </div>
              {errors.degree_applying_for && <span className="text-[10px] text-red-500 flex items-center gap-1">⚠ {errors.degree_applying_for.message}</span>}
            </div>

            {/* Intended Major */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />Intended Major / Course <span className="text-blue-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input {...register('intended_major', { required: 'Intended major is required' })} placeholder="e.g. Computer Science, Business, Medicine…" autoComplete="off" className="h-12 pl-10 text-base" />
              </div>
              {errors.intended_major && <span className="text-[10px] text-red-500 flex items-center gap-1">⚠ {errors.intended_major.message}</span>}
              {/* Quick-pick chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Computer Science', 'Business', 'Engineering', 'Medicine', 'Law', 'Data Science'].map(s => (
                  <button key={s} type="button" onClick={() => setValue('intended_major', s)}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors border border-gray-200 dark:border-gray-700 hover:border-blue-300 font-medium">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* AI info box — enhanced */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50/50 dark:from-blue-900/20 dark:to-teal-900/10 border border-blue-100 dark:border-blue-800/50 p-4 flex gap-3 items-start">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-0.5">AI-powered matching</p>
                <p className="text-xs text-blue-700/80 dark:text-blue-400/80 leading-relaxed">Your subject is used to retrieve compatible programs and rank universities by fit and affordability.</p>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <p className="text-xs text-gray-400 dark:text-gray-500 italic flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
              Leave any field blank if you haven't taken that test.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: 'IELTS', field: 'ielts', placeholder: '0 – 9.0', step: '0.5', range: '0 – 9.0',   gradient: 'from-blue-500 to-indigo-500',   lightBg: 'bg-blue-50 dark:bg-blue-900/20',     border: 'border-blue-300 dark:border-blue-700',   accent: 'text-blue-700 dark:text-blue-300',   badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'   },
                { label: 'TOEFL', field: 'toefl', placeholder: '0 – 120',  step: '1',   range: '0 – 120',   gradient: 'from-violet-500 to-purple-500', lightBg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-300 dark:border-violet-700', accent: 'text-violet-700 dark:text-violet-300', badge: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300' },
                { label: 'GRE',   field: 'gre',   placeholder: 'e.g. 310', step: '1',   range: '260 – 340', gradient: 'from-emerald-500 to-teal-500',   lightBg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-300 dark:border-emerald-700', accent: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' },
                { label: 'GMAT',  field: 'gmat',  placeholder: 'e.g. 680', step: '1',   range: '200 – 800', gradient: 'from-amber-500 to-orange-500',   lightBg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-300 dark:border-amber-700',   accent: 'text-amber-700 dark:text-amber-300',   badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'   },
                { label: 'SAT',   field: 'sat',   placeholder: 'e.g. 1400', step: '1',  range: '400 – 1600', gradient: 'from-rose-500 to-pink-500',     lightBg: 'bg-rose-50 dark:bg-rose-900/20',     border: 'border-rose-300 dark:border-rose-700',     accent: 'text-rose-700 dark:text-rose-300',     badge: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'     },
              ].map(({ label, field, placeholder, step, range, gradient, lightBg, border, accent, badge }) => {
                const val = watch(field);
                const isFilled = val !== '' && val !== undefined && val !== null;
                return (
                  <div key={field} className={cn(
                    'relative rounded-2xl p-4 border-2 transition-all duration-300',
                    isFilled
                      ? `${border} ${lightBg} shadow-sm`
                      : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'
                  )}>
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn('h-6 w-6 rounded-lg flex items-center justify-center text-white text-[9px] font-black bg-gradient-to-br shadow-sm shrink-0', gradient)}>
                          {label[0]}
                        </div>
                        <span className={cn('text-sm font-bold', isFilled ? accent : 'text-gray-700 dark:text-gray-300')}>{label}</span>
                      </div>
                      <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-bold', isFilled ? badge : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600')}>{range}</span>
                    </div>
                    <Input {...register(field)} type="number" step={step} placeholder={placeholder}
                      className={cn('h-10 text-sm font-semibold', isFilled ? 'border-transparent bg-white/70 dark:bg-gray-900/50' : '')} />
                    {isFilled && (
                      <div className={cn('absolute top-3 right-3 h-2 w-2 rounded-full bg-gradient-to-br', gradient)} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 4: {
        const FEATURED = [
          { name: 'United Kingdom', label: '50+ curated universities' },
          { name: 'Canada', label: '42 curated universities' },
          { name: 'Australia', label: '35 curated universities' },
          { name: 'Germany', label: 'Public & private options' },
          { name: 'Malaysia', label: 'Regional education hub' },
          { name: 'UAE', displayName: 'United Arab Emirates', label: 'International campuses' },
          { name: 'Turkey', displayName: 'Türkiye', label: 'Affordable programs' },
        ];
        const allOther = ALL_DESTINATIONS.filter(c => !FEATURED.find(f => f.name === c));
        const filteredOther = countrySearch
          ? allOther.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()))
          : allOther;
        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Search + counter */}
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  placeholder="Search destinations…"
                  value={countrySearch}
                  onChange={(e) => { setCountrySearch(e.target.value); setShowAllCountries(true); }}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none transition-all text-sm"
                />
              </div>
              {watchCountries.length > 0 && (
                <div className="shrink-0 bg-blue-50 text-blue-600 px-3 py-2 rounded-xl text-xs font-bold border border-blue-100 whitespace-nowrap">
                  {watchCountries.length}/3 selected
                </div>
              )}
            </div>

            {/* Featured grid */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Featured Destinations</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {FEATURED.map(country => {
                  const isSelected = watchCountries.includes(country.name);
                  const isMaxed = !isSelected && watchCountries.length >= 3;
                  return (
                    <button
                      key={country.name}
                      type="button"
                      onClick={() => !isMaxed && toggleItem('countries', country.name)}
                      className={cn(
                        "text-left p-3.5 rounded-2xl border-2 transition-all duration-200 relative flex flex-col gap-2",
                        isSelected
                          ? "border-blue-500 bg-blue-50/50 ring-4 ring-blue-500/10 shadow-md shadow-blue-500/10 -translate-y-0.5"
                          : isMaxed
                            ? "border-gray-100 bg-gray-50/50 opacity-50 cursor-not-allowed"
                            : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 hover:-translate-y-0.5 cursor-pointer"
                      )}
                    >
                      <div className={cn(
                        "absolute top-3 right-3 h-5 w-5 rounded-full flex items-center justify-center transition-all duration-200",
                        isSelected ? "bg-blue-500" : "bg-gray-100"
                      )}>
                        <Check className={cn("h-3 w-3 transition-opacity", isSelected ? "text-white opacity-100" : "text-gray-300 opacity-0")} />
                      </div>
                      <img
                        src={getFlagUrl(country.name)}
                        alt={country.displayName || country.name}
                        className="w-7 h-5 object-cover rounded shadow-sm border border-gray-100"
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs leading-tight">{country.displayName || country.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{country.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expand toggle */}
            {!countrySearch && (
              <button
                type="button"
                onClick={() => setShowAllCountries(v => !v)}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors py-1"
              >
                <span className="text-lg leading-none">{showAllCountries ? '−' : '+'}</span>
                {showAllCountries ? 'Hide other destinations' : 'Explore all 70+ destinations'}
              </button>
            )}

            {/* Other countries */}
            {(countrySearch || showAllCountries) && filteredOther.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Other Destinations</p>
                <div className="flex flex-wrap gap-2">
                  {filteredOther.map(c => {
                    const isSelected = watchCountries.includes(c);
                    const isMaxed = !isSelected && watchCountries.length >= 3;
                    return (
                      <button
                        key={c} type="button"
                        onClick={() => !isMaxed && toggleItem('countries', c)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-medium transition-all border flex items-center gap-1.5",
                          isSelected
                            ? "bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20"
                            : isMaxed
                              ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                              : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700"
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      }
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Budget Mode */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Budget Mode</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'total', label: 'Total Budget', desc: 'Set overall limit' },
                  { value: 'detailed', label: 'Detailed Budget', desc: 'Per-fee breakdown' },
                ].map(opt => {
                  const isActive = watch('budget_mode') === opt.value;
                  return (
                    <label key={opt.value} className={cn(
                      "flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all",
                      isActive ? "border-blue-500 bg-blue-50/50 ring-4 ring-blue-500/10" : "border-gray-200 bg-white hover:border-gray-300"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <input type="radio" value={opt.value} {...register('budget_mode')} className="w-4 h-4 accent-blue-600" />
                        <span className="text-sm font-bold text-gray-900">{opt.label}</span>
                      </div>
                      <span className="text-[11px] text-gray-500 pl-6">{opt.desc}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Budget Fields */}
            {watch('budget_mode') === 'total' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Currency</label>
                  <select {...register('currency')} className={selectCls}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="PKR">PKR (₨)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Budget Amount</label>
                  <Input {...register('total_budget')} type="number" placeholder="e.g. 50000" className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Period</label>
                  <select {...register('budget_period')} className={selectCls}>
                    <option value="per_year">Per Year</option>
                    <option value="full_degree">Full Degree</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Currency</label>
                  <select {...register('currency')} className={selectCls}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="PKR">PKR (₨)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Max Tuition Fee</label>
                  <Input {...register('max_course_tuition_fee')} type="number" placeholder="e.g. 30000" className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Max Application Fee</label>
                  <Input {...register('max_application_fee')} type="number" placeholder="e.g. 100" className="h-11" />
                </div>
              </div>
            )}

            {/* Financial Needs */}
            <div className="pt-5 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Financial Needs</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { field: 'need_scholarship', label: 'Need Scholarship?', desc: 'Show scholarship-eligible options' },
                  { field: 'fully_funded_required', label: 'Fully Funded Required?', desc: 'Only fully-funded programs' },
                ].map(({ field, label, desc }) => (
                  <label key={field} className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    watch(field) ? "border-blue-300 bg-blue-50/30" : "border-gray-200 bg-white hover:bg-gray-50"
                  )}>
                    <input type="checkbox" {...register(field)} className="w-5 h-5 rounded mt-0.5 accent-blue-600 shrink-0" />
                    <div>
                      <span className="text-sm font-semibold text-gray-900 block">{label}</span>
                      <span className="text-[11px] text-gray-500">{desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Card 1 – Academic Profile */}
              <div className="bg-gradient-to-br from-white to-blue-50/20 dark:from-gray-900 dark:to-gray-900 border border-blue-100/70 dark:border-gray-700 rounded-2xl p-5 relative hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md hover:shadow-blue-500/5 transition-all">
                <button type="button" onClick={() => setCurrentStep(1)} className="absolute top-4 right-4 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors">Edit</button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm">01</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Academic profile</h4>
                    <p className="text-[10px] text-gray-400">Eligibility evidence</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Qualification</span><span className="text-xs font-bold text-gray-900">{watch('current_degree_level') || '—'}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">CGPA</span><span className="text-xs font-bold text-gray-900">{watch('cgpa') || '—'} / 4.00</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Country</span><span className="text-xs font-bold text-gray-900">{watch('country') || '—'}</span></div>
                </div>
              </div>

              {/* Card 2 – Target Study */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 relative hover:border-gray-300 transition-colors">
                <button type="button" onClick={() => setCurrentStep(2)} className="absolute top-4 right-4 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors">Edit</button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-sm">02</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Target study</h4>
                    <p className="text-[10px] text-gray-400">Degree and subject fit</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Degree</span><span className="text-xs font-bold text-gray-900">{watch('degree_applying_for') || '—'}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Major</span><span className="text-xs font-bold text-gray-900 max-w-[110px] truncate text-right">{watch('intended_major') || '—'}</span></div>
                </div>
              </div>

              {/* Card 3 – Test Scores */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 relative hover:border-gray-300 transition-colors">
                <button type="button" onClick={() => setCurrentStep(3)} className="absolute top-4 right-4 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors">Edit</button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-yellow-50 text-yellow-600 font-bold flex items-center justify-center text-sm">03</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Tests & language</h4>
                    <p className="text-[10px] text-gray-400">Submitted evidence</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {watch('ielts') ? <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100">IELTS {watch('ielts')}</span> : <span className="px-2.5 py-1 bg-gray-50 text-gray-400 rounded-full text-[10px] font-bold border border-gray-200">No IELTS</span>}
                  {watch('toefl') ? <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold border border-purple-100">TOEFL {watch('toefl')}</span> : null}
                  {watch('gre') ? <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100">GRE {watch('gre')}</span> : <span className="px-2.5 py-1 bg-gray-50 text-gray-400 rounded-full text-[10px] font-bold border border-gray-200">No GRE</span>}
                  {watch('gmat') ? <span className="px-2.5 py-1 bg-gray-50 text-gray-700 rounded-full text-[10px] font-bold border border-gray-200">GMAT {watch('gmat')}</span> : null}
                  {watch('sat') ? <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold border border-orange-100">SAT {watch('sat')}</span> : null}
                </div>
              </div>

              {/* Card 4 – Budget */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 relative hover:border-gray-300 transition-colors">
                <button type="button" onClick={() => setCurrentStep(5)} className="absolute top-4 right-4 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors">Edit</button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-pink-50 text-pink-600 font-bold flex items-center justify-center text-sm">04</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Budget & funding</h4>
                    <p className="text-[10px] text-gray-400">Affordability context</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Max tuition</span><span className="text-xs font-bold text-gray-900">≤ {watch('currency') || 'USD'} {watch('budget_mode') === 'total' ? (watch('total_budget') || '—') : (watch('max_course_tuition_fee') || '—')}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Scholarship</span><span className={cn("text-xs font-bold", watch('need_scholarship') ? "text-orange-600" : "text-gray-900")}>{watch('need_scholarship') ? 'Required' : 'Not required'}</span></div>
                </div>
              </div>

              {/* Card 5 – Destinations (full width) */}
              <div className="bg-gradient-to-br from-white to-blue-50/20 dark:from-gray-900 dark:to-gray-900 border border-blue-100/70 dark:border-gray-700 rounded-2xl p-5 relative hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md hover:shadow-blue-500/5 transition-all sm:col-span-2">
                <button type="button" onClick={() => setCurrentStep(4)} className="absolute top-4 right-4 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors">Edit</button>
                <div className="mb-3">
                  <h4 className="font-bold text-gray-900 text-sm">Preferred destinations</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">The search may include exceptional alternatives when enabled.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {watchCountries.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">No destinations selected — all destinations will be searched.</span>
                  ) : watchCountries.map(c => (
                    <div key={c} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-xl border border-blue-100/50">
                      <img src={getFlagUrl(c)} alt={c} className="w-4 h-3 object-cover rounded-sm shadow-sm" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                      <span className="text-xs font-bold text-blue-900">{c === 'UAE' ? 'United Arab Emirates' : c === 'Turkey' ? 'Türkiye' : c}</span>
                    </div>
                  ))}
                  {watch('open_to_all_destinations') && (
                    <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-700">
                      <span className="text-gray-400">+</span> Strong alternatives enabled
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const progressPct = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-gray-950 flex flex-col overflow-hidden animate-in fade-in duration-300">

      {/* Top Gradient Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400" />

      {/* ─── HEADER ─── */}
      <div className="flex items-center px-4 md:px-8 h-14 md:h-16 border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm shadow-sm shrink-0 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <img src={studyrouteLogoDark} alt="StudyRoute" className="w-[90px] md:w-[110px] h-auto object-contain" />
        </div>

        {/* Desktop Step Indicator */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => { if (isCompleted) setCurrentStep(step.id); }}
                  className={cn(
                    "flex items-center gap-1.5 shrink-0 rounded-full px-2 py-1 transition-all duration-200",
                    isCompleted ? "cursor-pointer hover:bg-gray-50" : "cursor-default"
                  )}
                >
                  <div className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                    isCompleted ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30" :
                      isCurrent ? "bg-gradient-to-br from-blue-600 to-teal-500 text-white ring-4 ring-blue-500/20 shadow-md shadow-blue-500/30" : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                  )}>
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.id}
                  </div>
                  <span className={cn(
                    "text-xs font-bold transition-colors hidden xl:block",
                    isCurrent ? "text-gray-900" : isCompleted ? "text-gray-600" : "text-gray-400"
                  )}>
                    {step.title}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "h-[2px] w-4 lg:w-5 xl:w-8 transition-colors duration-500 rounded-full shrink-0",
                    isCompleted ? "bg-emerald-400" : "bg-gray-200"
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile step text */}
        <div className="flex flex-1 lg:hidden items-center justify-center">
          <span className="text-xs font-bold text-gray-500">
            Step <span className="text-blue-600 font-black">{currentStep}</span> of {STEPS.length} — {STEPS[currentStep - 1].title}
          </span>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 ml-auto h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all"
          aria-label="Close wizard"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile Progress Bar */}
      <div className="lg:hidden h-1 bg-gray-100 shrink-0">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-950">
        <div className="max-w-[1400px] mx-auto w-full px-4 py-4 lg:px-8 lg:py-6">

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 xl:gap-14">
            {/* ── LEFT: Main Form ── */}
            <div className="flex-1 flex flex-col min-w-0">
              
              {/* Step Header */}
              <div className="mb-5 lg:mb-6 shrink-0 pb-5 border-b border-gray-100 dark:border-gray-800">
                <p className="text-blue-600 dark:text-blue-400 font-bold text-[9px] tracking-[0.2em] uppercase mb-2">
                  {STEP_CONTENT[currentStep].stepLabel}
                </p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2 font-serif tracking-tight leading-tight">
                  {STEP_CONTENT[currentStep].heading}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-2xl leading-relaxed">
                  {STEP_CONTENT[currentStep].subtext}
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (currentStep === 6) {
                    handleSubmit(handleFormSubmit)(e);
                  } else {
                    nextStep();
                  }
                }}
                className="flex flex-col"
              >
                <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-gray-900 rounded-2xl p-4 sm:p-5 lg:p-6 border border-blue-100/60 dark:border-gray-700 shadow-[0_4px_24px_rgb(59,130,246,0.06)] dark:shadow-none mb-4">
                  {renderStep()}

                  {/* Profile prefill alert */}
                  {prefillSource && currentStep === 1 && (
                    <div className="bg-emerald-50/80 border border-emerald-100 p-4 rounded-xl flex items-start gap-3 mt-6">
                      <div className="bg-emerald-100 p-1.5 rounded-full shrink-0">
                        <Check className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-900 text-sm mb-0.5">Profile data applied</p>
                        <p className="text-xs text-emerald-700/80">
                          {prefillSource === 'profile'
                            ? 'We pre-filled this form using your saved profile data.'
                            : 'We restored your previous search preferences.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── NAVIGATION BUTTONS ── */}
                <div className="flex items-center justify-between gap-3 shrink-0">
                  {/* Back / Cancel */}
                  <button
                    type="button"
                    onClick={currentStep === 1 ? onClose : prevStep}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {currentStep === 1 ? 'Cancel' : 'Back'}
                  </button>

                  {/* Continue / Generate */}
                  {currentStep === 6 ? (
                    <button
                      type="button"
                      onClick={async () => {
                        const isValid = await trigger();
                        if (isValid) handleSubmit(handleFormSubmit)();
                      }}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-teal-500 to-blue-600 animate-gradient-shift text-white font-bold text-sm shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Generating…
                        </>
                      ) : (
                        <>Generate my shortlist <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-teal-500 to-blue-600 animate-gradient-shift text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      Continue to {STEPS[currentStep]?.title?.toLowerCase() || 'next'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {currentStep === 6 && (
                  <p className="text-center text-[10px] text-gray-400 mt-3">Usually takes 20–40 seconds</p>
                )}
              </form>
            </div>

            {/* ── RIGHT: Info Panel ── */}
            <div className="w-full lg:w-[340px] xl:w-[370px] shrink-0 space-y-4 lg:space-y-5">
            {currentStep === 6 ? (
              <>
                <div className="bg-[#182a3d] rounded-[2.5rem] p-8 lg:p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-20 right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10">
                    <h4 className="text-emerald-400 font-bold text-[10px] tracking-widest uppercase mb-6">Ready to discover</h4>
                    <h3 className="text-3xl font-black mb-4 font-serif leading-tight">
                      Generate a controlled, explainable shortlist.
                    </h3>
                    <p className="text-blue-100/70 text-xs mb-8 pb-8 border-b border-white/10 leading-relaxed">
                      StudyRoute retrieves records first, ranks a candidate pool, then uses AI only for bounded selection and explanation.
                    </p>
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs text-white/90">Database candidate retrieval</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs text-white/90">Deterministic scoring</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs text-white/90">AI candidate validation</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs text-white/90">Official fact hydration</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        const isValid = await trigger();
                        if (isValid) handleSubmit(handleFormSubmit)();
                      }}
                      disabled={isLoading}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-teal-500 to-blue-600 animate-gradient-shift text-white font-bold text-sm shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:scale-[1.02] transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      Generate my shortlist &rarr;
                    </button>
                    <p className="text-center text-[10px] text-white/50 mt-4">Usually takes 20-40 seconds</p>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100">
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold tracking-widest uppercase mb-4 inline-block">Important</span>
                  <p className="text-xs text-amber-900/80 leading-relaxed font-medium">
                    Results support shortlisting and do not guarantee admission, funding or visa outcomes.
                  </p>
                </div>
              </>
            ) : currentStep === 4 ? (
              <>
                {/* Step 4: Selected Route Card */}
                <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <h4 className="text-blue-600 font-bold text-[10px] tracking-widest uppercase mb-4">Selected Route</h4>
                  <h3 className="text-xl font-black text-gray-900 mb-6 font-serif">Your target countries</h3>

                  <div className="space-y-2 mb-8">
                    {watchCountries.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No countries selected yet.</p>
                    ) : (
                      watchCountries.map(c => (
                        <div key={c} className="flex items-center justify-between p-3 rounded-xl border border-blue-100/60 bg-blue-50/30 group hover:bg-blue-50/80 transition-colors">
                          <div className="flex items-center gap-3">
                            <img src={getFlagUrl(c)} alt={c} className="w-6 h-4 object-cover rounded-sm shadow-sm border border-gray-200/50" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                            <span className="text-sm font-bold text-blue-900">{c === 'UAE' ? 'United Arab Emirates' : c === 'Turkey' ? 'Türkiye' : c}</span>
                          </div>
                          <button type="button" onClick={() => toggleItem('countries', c)} className="text-blue-300 hover:text-blue-600 transition-colors bg-white hover:bg-blue-100 rounded p-1">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                      <input type="checkbox" {...register('open_to_all_destinations')} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 block mb-1 group-hover:text-blue-600 transition-colors">Include your preferred countries</span>
                      <span className="text-[11px] text-gray-500 block leading-tight">Also include the destinations saved in your study preferences.</span>
                    </div>
                  </label>
                </div>

                {/* Step 4: Image Card */}
                <div className="rounded-[2.5rem] p-8 lg:p-10 text-white shadow-2xl relative overflow-hidden h-64 flex flex-col justify-end bg-gray-900">
                  <div className="absolute inset-0 bg-[url('/images/slider/3.jpg')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#182a3d] via-[#182a3d]/80 to-transparent" />
                  <div className="relative z-10">
                    <h4 className="text-blue-300 font-bold text-[9px] tracking-widest uppercase mb-3">Better Discovery</h4>
                    <h3 className="text-xl font-black mb-2 font-serif leading-tight">
                      Preferences guide the search. They do not trap it.
                    </h3>
                    <p className="text-gray-300/80 text-[11px]">
                      You remain in control of every final decision.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Why we ask this (Other Steps) */}
                <div className="bg-[#182a3d] rounded-[1.5rem] p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10">
                    <h4 className="text-blue-400 font-bold text-[9px] lg:text-[10px] tracking-widest uppercase mb-3 lg:mb-4">Why we ask this</h4>
                    <h3 className="text-xl lg:text-2xl font-black mb-2 lg:mb-3 font-serif leading-tight">
                      {STEP_CONTENT[currentStep].whyTitle}
                    </h3>
                    <p className="text-blue-100/70 text-xs lg:text-sm mb-5 pb-5 lg:mb-6 lg:pb-6 border-b border-white/10 leading-relaxed">
                      {STEP_CONTENT[currentStep].whyDesc}
                    </p>
                    <div className="space-y-3 lg:space-y-4">
                      {STEP_CONTENT[currentStep].whyPoints.map((pt, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500/40 to-teal-400/30 border border-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
                            <span className="text-[9px] font-black">{String(i + 1).padStart(2, '0')}</span>
                          </div>
                          <span className="text-xs lg:text-sm font-medium text-white/90 leading-snug">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Search Summary (Other Steps) */}
                <div className="bg-white rounded-[1.5rem] p-6 lg:p-8 border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <h4 className="text-blue-600 font-bold text-[9px] lg:text-[10px] tracking-widest uppercase mb-4 lg:mb-6">Search Summary</h4>
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Qualification</span>
                      <span className="text-sm font-bold text-gray-900">{watch('degree_applying_for') || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Subject</span>
                      <span className="text-sm font-bold text-gray-900 truncate max-w-[180px]">{watch('intended_major') || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Destinations</span>
                      <span className="text-sm font-bold text-gray-900 truncate max-w-[180px]">
                        {watch('open_to_all_destinations') ? 'Any' : (watch('countries')?.length ? watch('countries').join(', ') : '—')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Budget</span>
                      <span className="text-sm font-bold text-gray-900">
                        {watch('budget_mode') === 'total' && watch('total_budget') ? `${watch('currency')} ${watch('total_budget')}` : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UniversityFinderModal;
