import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import {
  X, Check, Search, ArrowLeft, ArrowRight
} from 'lucide-react';
import Input from '../common/Input';
import { cn } from '../../utils/cn';
import { ALL_DESTINATIONS } from '../../constants/studyDestinations';

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
    subtext: 'Select specific countries or let us find the best global matches for your profile.',
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
      const avoided = payload.avoid_countries || [];
      payload.countries = ALL_DESTINATIONS.filter(c => !avoided.includes(c));
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
      setValue(field, [...current, value]);
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name *</label>
                <Input {...register('full_name', { required: 'Name is required' })} placeholder="Enter your full name" autoComplete="name" className="h-12" />
                {errors.full_name && <span className="text-xs text-red-500">{errors.full_name.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email *</label>
                <Input {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
                })} type="email" placeholder="email@example.com" autoComplete="email" className="h-12" />
                {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Home Country *</label>
                <Input {...register('country', { required: 'Country is required' })} placeholder="Your current country" autoComplete="country-name" className="h-12" />
                {errors.country && <span className="text-xs text-red-500">{errors.country.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Current Degree Level *</label>
                <select {...register('current_degree_level', { required: 'Degree level is required' })} className="w-full h-12 rounded-xl border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                  <option value="">-- Select Degree --</option>
                  <option value="Bachelors">Bachelors</option>
                  <option value="Masters">Masters</option>
                  <option value="MPhil">MPhil</option>
                  <option value="PhD">PhD</option>
                </select>
                {errors.current_degree_level && <span className="text-xs text-red-500">{errors.current_degree_level.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Current University</label>
                <Input {...register('current_university')} placeholder="University Name" autoComplete="off" className="h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Current CGPA *</label>
                <Input {...register('cgpa', { required: 'CGPA is required' })} type="number" step="0.01" placeholder="e.g. 3.8" className="h-12" />
                {errors.cgpa && <span className="text-xs text-red-500">{errors.cgpa.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Graduation Year</label>
                <Input {...register('graduation_year')} type="number" placeholder="e.g. 2025" className="h-12" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Target Study Level *</label>
                  <select {...register('degree_applying_for', { required: 'Target Study Level is required' })} className="w-full h-12 rounded-xl border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="">-- Select Level --</option>
                    <option value="Bachelors">Bachelors</option>
                    <option value="Masters">Masters</option>
                    <option value="MPhil">MPhil</option>
                    <option value="PhD">PhD</option>
                  </select>
                  {errors.degree_applying_for && <span className="text-xs text-red-500">{errors.degree_applying_for.message}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Intended Major / Course *</label>
                  <Input {...register('intended_major', { required: 'Intended major is required' })} placeholder="e.g. Computer Science" autoComplete="off" className="h-12" />
                  {errors.intended_major && <span className="text-xs text-red-500">{errors.intended_major.message}</span>}
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">IELTS</label>
                <Input {...register('ielts')} type="number" step="0.5" placeholder="0 - 9.0" className="h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">TOEFL</label>
                <Input {...register('toefl')} type="number" placeholder="0 - 120" className="h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">GRE</label>
                <Input {...register('gre')} type="number" placeholder="e.g. 310" className="h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">GMAT</label>
                <Input {...register('gmat')} type="number" placeholder="e.g. 680" className="h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">SAT</label>
                <Input {...register('sat')} type="number" placeholder="e.g. 1400" className="h-12" />
              </div>
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
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  placeholder="Search destinations"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                />
              </div>
              <select className="h-14 px-4 pr-8 rounded-2xl border border-gray-200 bg-white text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none text-sm min-w-[140px]">
                <option value="all">Region: All</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURED.map(country => {
                const isSelected = watchCountries.includes(country.name);
                return (
                  <button
                    key={country.name}
                    type="button"
                    onClick={() => toggleItem('countries', country.name)}
                    className={cn(
                      "text-left p-5 rounded-2xl border-2 transition-all duration-200 relative group flex flex-col",
                      isSelected
                        ? "border-blue-500 bg-white shadow-sm ring-4 ring-blue-500/10"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    )}
                  >
                    <div className={cn(
                      "absolute top-4 right-4 h-5 w-5 rounded bg-blue-50 flex items-center justify-center transition-colors",
                      isSelected ? "text-blue-600" : "text-transparent bg-transparent group-hover:bg-gray-50"
                    )}>
                      <Check className="h-3 w-3" />
                    </div>
                    <img
                      src={getFlagUrl(country.name)}
                      alt={country.displayName || country.name}
                      className="w-8 h-6 object-cover rounded shadow-sm mb-4 border border-gray-100"
                      onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    />
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{country.displayName || country.name}</h4>
                    <p className="text-[11px] text-gray-500 font-medium">{country.label}</p>
                  </button>
                );
              })}

              <button
                type="button"
                className="text-center p-5 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 flex flex-col items-center justify-center min-h-[140px]"
              >
                <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 mb-3 border border-blue-100/50">
                  <span className="text-xl leading-none font-light">+</span>
                </div>
                <h4 className="font-bold text-gray-900 text-[13px]">Explore all 70 destinations</h4>
              </button>
            </div>

            {countrySearch && (
              <div className="mt-6">
                 <h4 className="text-sm font-bold text-gray-900 mb-4">Other Destinations</h4>
                 <div className="flex flex-wrap gap-2">
                   {ALL_DESTINATIONS
                     .filter(c => !FEATURED.find(f => f.name === c) && c.toLowerCase().includes(countrySearch.toLowerCase()))
                     .map(c => {
                       const isSelected = watchCountries.includes(c);
                       return (
                         <button
                           key={c} type="button"
                           onClick={() => toggleItem('countries', c)}
                           className={cn(
                             "px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                             isSelected
                               ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-2 ring-blue-500/20"
                               : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700"
                           )}
                         >
                           <div className="flex items-center gap-2">
                             {isSelected && <Check className="w-3 h-3" />}
                             {c}
                           </div>
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
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">Budget Mode</label>
                <div className="flex gap-4 mb-6">
                  <label className="flex items-center justify-center gap-3 p-4 flex-1 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="radio" value="total" {...register('budget_mode')} className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Total Budget</span>
                  </label>
                  <label className="flex items-center justify-center gap-3 p-4 flex-1 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="radio" value="detailed" {...register('budget_mode')} className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Detailed Budget</span>
                  </label>
                </div>

                {watch('budget_mode') === 'total' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Currency</label>
                      <select {...register('currency')} className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-primary outline-none">
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="PKR">PKR (₨)</option>
                        <option value="CAD">CAD ($)</option>
                        <option value="AUD">AUD ($)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Total Budget Amount</label>
                      <Input {...register('total_budget')} type="number" placeholder="e.g. 50000" className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Period</label>
                      <select {...register('budget_period')} className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-primary outline-none">
                        <option value="per_year">Per Year</option>
                        <option value="full_degree">Full Degree</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Currency</label>
                      <select {...register('currency')} className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-primary outline-none">
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="PKR">PKR (₨)</option>
                        <option value="CAD">CAD ($)</option>
                        <option value="AUD">AUD ($)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Max Tuition Fee</label>
                      <Input {...register('max_course_tuition_fee')} type="number" placeholder="e.g. 30000" className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Max Application Fee</label>
                      <Input {...register('max_application_fee')} type="number" placeholder="e.g. 100" className="h-12" />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-4">Financial Needs</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" {...register('need_scholarship')} className="w-5 h-5 rounded text-primary" />
                    <span className="text-sm font-medium">Need Scholarship?</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" {...register('fully_funded_required')} className="w-5 h-5 rounded text-primary" />
                    <span className="text-sm font-medium">Fully Funded Required?</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Card 1 */}
              <div className="bg-white border border-gray-200 rounded-[1.5rem] p-6 relative group hover:border-gray-300 transition-colors">
                <button type="button" onClick={() => setCurrentStep(1)} className="absolute top-6 right-6 text-xs font-bold text-blue-600 hover:text-blue-800">Edit</button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-lg">01</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Academic profile</h4>
                    <p className="text-xs text-gray-500">Evidence used for eligibility</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Qualification</span><span className="text-sm font-bold text-gray-900">{watch('current_degree_level') || '—'} {watch('intended_major') || ''}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">CGPA</span><span className="text-sm font-bold text-gray-900">{watch('cgpa') || '—'} / 4.00</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Backlogs</span><span className="text-sm font-bold text-gray-900">None</span></div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-gray-200 rounded-[1.5rem] p-6 relative group hover:border-gray-300 transition-colors">
                <button type="button" onClick={() => setCurrentStep(2)} className="absolute top-6 right-6 text-xs font-bold text-blue-600 hover:text-blue-800">Edit</button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-lg">02</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Target study</h4>
                    <p className="text-xs text-gray-500">Degree and subject fit</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Degree</span><span className="text-sm font-bold text-gray-900">{watch('degree_applying_for') || '—'}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Major</span><span className="text-sm font-bold text-gray-900">{watch('intended_major') || '—'}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Intake</span><span className="text-sm font-bold text-gray-900">September 2027</span></div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-gray-200 rounded-[1.5rem] p-6 relative group hover:border-gray-300 transition-colors">
                <button type="button" onClick={() => setCurrentStep(3)} className="absolute top-6 right-6 text-xs font-bold text-blue-600 hover:text-blue-800">Edit</button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 font-bold flex items-center justify-center text-lg">03</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Tests and language</h4>
                    <p className="text-xs text-gray-500">Submitted evidence</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {watch('ielts') ? <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">IELTS {watch('ielts')}</span> : <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-bold border border-gray-200">No IELTS</span>}
                  {watch('gre') ? <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">GRE {watch('gre')}</span> : <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-bold border border-gray-200">No GRE</span>}
                  {watch('gmat') ? <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-bold border border-gray-200">GMAT {watch('gmat')}</span> : <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-bold border border-gray-200">No GMAT</span>}
                </div>
                <p className="text-[11px] text-gray-400">Official evidence can be updated later from your profile.</p>
              </div>

              {/* Card 4 */}
              <div className="bg-white border border-gray-200 rounded-[1.5rem] p-6 relative group hover:border-gray-300 transition-colors">
                <button type="button" onClick={() => setCurrentStep(5)} className="absolute top-6 right-6 text-xs font-bold text-blue-600 hover:text-blue-800">Edit</button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 font-bold flex items-center justify-center text-lg">04</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Budget and funding</h4>
                    <p className="text-xs text-gray-500">Affordability context</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Annual tuition</span><span className="text-sm font-bold text-gray-900">≤ {watch('currency') || 'USD'} {watch('budget_mode') === 'total' ? watch('total_budget') : watch('max_course_tuition_fee')}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Scholarship</span><span className={cn("text-sm font-bold", watch('need_scholarship') ? "text-orange-600" : "text-gray-900")}>{watch('need_scholarship') ? 'Required' : 'Not required'}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Funding</span><span className="text-sm font-bold text-gray-900">{watch('need_scholarship') ? 'Family + scholarship' : 'Family / Self-funded'}</span></div>
                </div>
              </div>

              {/* Card 5 Full Width */}
              <div className="bg-white border border-gray-200 rounded-[1.5rem] p-6 relative group hover:border-gray-300 transition-colors md:col-span-2">
                <button type="button" onClick={() => setCurrentStep(4)} className="absolute top-6 right-6 text-xs font-bold text-blue-600 hover:text-blue-800">Edit</button>
                <div className="mb-4">
                  <h4 className="font-bold text-gray-900 text-lg">Preferred destinations</h4>
                  <p className="text-xs text-gray-500">The search may include exceptional alternatives when enabled.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {watchCountries.map(c => (
                    <div key={c} className="flex items-center gap-2 px-4 py-2 bg-blue-50/50 rounded-xl border border-blue-100/50">
                      <img src={getFlagUrl(c)} alt={c} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                      <span className="text-sm font-bold text-blue-900">{c === 'UAE' ? 'United Arab Emirates' : c === 'Turkey' ? 'Türkiye' : c}</span>
                    </div>
                  ))}
                  {watch('open_to_all_destinations') && (
                    <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl flex items-center gap-2 text-sm font-bold text-gray-700">
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

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-[#fcfcfc] flex flex-col overflow-hidden animate-in fade-in duration-300">

      {/* Top Gradient Bar */}
      <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-emerald-400 to-yellow-400" />

      {/* Header NavBar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/80 bg-white shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
            S
          </div>
          <span className="font-black text-xl tracking-tight text-gray-900">StudyRoute</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4 hidden lg:flex">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                    isCompleted ? "bg-emerald-500 text-white shadow-sm" :
                    isCurrent ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-600/20" : "bg-gray-100 text-gray-400"
                  )}>
                    {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <span className={cn(
                    "text-sm font-bold transition-colors hidden xl:block",
                    isCurrent ? "text-gray-900" : "text-gray-400"
                  )}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "h-[2px] w-8 xl:w-16 transition-colors duration-300 rounded-full",
                    isCompleted ? "bg-emerald-500" : "bg-gray-200"
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-full border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
        >
          Save & exit
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto w-full flex flex-col lg:flex-row gap-8 xl:gap-16 p-6 lg:p-12 min-h-full">

          {/* Left Column (Main Form) */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Step Header */}
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <h4 className="text-blue-600 font-bold text-xs tracking-[0.2em] uppercase mb-4">
                  {STEP_CONTENT[currentStep].stepLabel}
                </h4>
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 font-serif tracking-tight">
                  {STEP_CONTENT[currentStep].heading}
                </h2>
                <p className="text-gray-500 text-lg lg:text-xl max-w-3xl leading-relaxed">
                  {STEP_CONTENT[currentStep].subtext}
                </p>
              </div>
              {currentStep === 4 && watchCountries.length > 0 && (
                <div className="hidden md:flex bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100 whitespace-nowrap mb-2">
                  {watchCountries.length} selected
                </div>
              )}
            </div>

            {/* Form Area */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 flex flex-col pb-12">
              <div className="bg-white rounded-[2rem] p-8 lg:p-10 border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
                {renderStep()}
              </div>

              {/* Alert for prefilled data */}
              {prefillSource && currentStep === 1 && (
                 <div className="bg-emerald-50/80 border border-emerald-100 p-5 rounded-2xl flex items-start gap-4 mb-8">
                   <div className="bg-emerald-100 p-2 rounded-full shrink-0">
                     <Check className="h-5 w-5 text-emerald-600" />
                   </div>
                   <div>
                     <p className="font-bold text-emerald-900 text-sm mb-1">Profile data applied</p>
                     <p className="text-sm text-emerald-700/80">
                       {prefillSource === 'profile'
                         ? 'We pre-filled this form using your saved profile data.'
                         : 'We restored your previous search preferences.'}
                     </p>
                   </div>
                 </div>
              )}

              {/* Bottom Nav */}
              {currentStep !== 6 && (
                <div className="flex items-center justify-between mt-auto">
                  <button
                    type="button"
                    onClick={currentStep === 1 ? onClose : prevStep}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-4 rounded-full border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="h-5 w-5" /> Back
                  </button>

                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={isLoading}
                    className="flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold text-lg shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    Continue to {STEPS[currentStep]?.title?.toLowerCase() || 'next'} <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </form>

            <div className="mt-auto pt-8 border-t border-gray-200/60 pb-8">
              <p className="text-xs font-black tracking-widest text-gray-400 uppercase">StudyRoute UniFinder</p>
            </div>
          </div>

          {/* Right Column (Cards) */}
          <div className="w-full lg:w-[380px] shrink-0 space-y-6 lg:mt-[132px]">
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
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold text-sm shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
                  <h3 className="text-xl font-black text-gray-900 mb-6 font-serif">Your preferred countries</h3>

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
                      <span className="text-sm font-bold text-gray-900 block mb-1 group-hover:text-blue-600 transition-colors">Include strong matches elsewhere</span>
                      <span className="text-[11px] text-gray-500 block leading-tight">We may show compelling alternatives outside your preferred list.</span>
                    </div>
                  </label>
                </div>

                {/* Step 4: Image Card */}
                <div className="rounded-[2.5rem] p-8 lg:p-10 text-white shadow-2xl relative overflow-hidden h-64 flex flex-col justify-end bg-gray-900">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay" />
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
                <div className="bg-[#182a3d] rounded-[2.5rem] p-8 lg:p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10">
                    <h4 className="text-blue-400 font-bold text-[10px] tracking-widest uppercase mb-6">Why we ask this</h4>
                    <h3 className="text-3xl font-black mb-4 font-serif leading-tight">
                      {STEP_CONTENT[currentStep].whyTitle}
                    </h3>
                    <p className="text-blue-100/70 text-sm mb-8 pb-8 border-b border-white/10 leading-relaxed">
                      {STEP_CONTENT[currentStep].whyDesc}
                    </p>
                    <div className="space-y-5">
                      {STEP_CONTENT[currentStep].whyPoints.map((pt, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 mt-0.5">
                            <span className="text-[10px] font-black">{String(i + 1).padStart(2, '0')}</span>
                          </div>
                          <span className="text-sm font-medium text-white/90 leading-snug">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Search Summary (Other Steps) */}
                <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <h4 className="text-blue-600 font-bold text-[10px] tracking-widest uppercase mb-8">Search Summary</h4>
                  <div className="space-y-5">
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
  );

  return createPortal(modalContent, document.body);
};

export default UniversityFinderModal;
