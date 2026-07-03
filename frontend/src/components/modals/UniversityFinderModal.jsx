import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  X, ChevronRight, ChevronLeft, User, GraduationCap, 
  MapPin, Globe, DollarSign, Languages, BrainCircuit,
  Search, CheckCircle2, AlertCircle, RotateCcw
} from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { cn } from '../../utils/cn';
import { ALL_DESTINATIONS } from '../../constants/studyDestinations';

const STEPS = [
  { id: 1, title: 'Personal Details', icon: User },
  { id: 2, title: 'Target Program', icon: BrainCircuit },
  { id: 3, title: 'Scores', icon: Languages },
  { id: 4, title: 'Location', icon: MapPin },
  { id: 5, title: 'Budget', icon: DollarSign },
  { id: 6, title: 'Review', icon: CheckCircle2 }
];

const UniversityFinderModal = ({ isOpen, onClose, onSubmit, isLoading, initialData, prefillSource }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [countrySearch, setCountrySearch] = useState('');
  const [avoidSearch, setAvoidSearch] = useState('');

  const defaultVals = {
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
    ...initialData,
  };

  const { register, handleSubmit, watch, setValue, reset, trigger, formState: { errors } } = useForm({
    defaultValues: defaultVals,
  });

  React.useEffect(() => {
    if (initialData) {
      reset({ ...defaultVals, ...initialData });
      setCurrentStep(1);
    }
  }, [initialData]); // eslint-disable-line

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

  const watchContinents = watch('continents') || [];
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Full Name *</label>
                <Input {...register('full_name', { required: 'Name is required' })} placeholder="Enter your full name" autoComplete="name" />
                {errors.full_name && <span className="text-xs text-red-500">{errors.full_name.message}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Email *</label>
                <Input {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
                })} type="email" placeholder="email@example.com" autoComplete="email" id="uf_email" />
                {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Home Country *</label>
                <Input {...register('country', { required: 'Country is required' })} placeholder="Your current country" autoComplete="country-name" />
                {errors.country && <span className="text-xs text-red-500">{errors.country.message}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Current Degree Level *</label>
                <select {...register('current_degree_level', { required: 'Degree level is required' })} className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                  <option value="">-- Select Degree --</option>
                  <option value="Bachelors">Bachelors</option>
                  <option value="Masters">Masters</option>
                  <option value="MPhil">MPhil</option>
                  <option value="PhD">PhD</option>
                </select>
                {errors.current_degree_level && <span className="text-xs text-red-500">{errors.current_degree_level.message}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Current University</label>
                <Input {...register('current_university')} placeholder="University Name" autoComplete="off" id="uf_current_university" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Current CGPA *</label>
                <Input {...register('cgpa', { required: 'CGPA is required' })} type="number" step="0.01" placeholder="e.g. 3.8" />
                {errors.cgpa && <span className="text-xs text-red-500">{errors.cgpa.message}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Graduation Year</label>
                <Input {...register('graduation_year')} type="number" placeholder="e.g. 2025" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-lg font-bold">Target Study Level *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Bachelors', 'Masters', 'MPhil', 'PhD'].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => { setValue('degree_applying_for', level); trigger('degree_applying_for'); }}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all font-bold",
                        watch('degree_applying_for') === level 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-gray-100 dark:border-gray-800 hover:border-primary/50"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                {/* Hidden input to register degree_applying_for */}
                <input type="hidden" {...register('degree_applying_for', { required: 'Target Study Level is required' })} />
                {errors.degree_applying_for && <span className="text-xs text-red-500">{errors.degree_applying_for.message}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Intended Major / Course *</label>
                <Input {...register('intended_major', { required: 'Intended major is required' })} placeholder="e.g. Computer Science, Artificial Intelligence" autoComplete="off" id="uf_intended_major" />
                {errors.intended_major && <span className="text-xs text-red-500">{errors.intended_major.message}</span>}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <p className="text-sm text-gray-500 italic">Language scores are optional but helpful for accurate recommendations.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold">IELTS</label>
                <Input {...register('ielts')} type="number" step="0.5" placeholder="0 - 9.0" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">TOEFL</label>
                <Input {...register('toefl')} type="number" placeholder="0 - 120" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">GRE</label>
                <Input {...register('gre')} type="number" placeholder="e.g. 310" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">GMAT</label>
                <Input {...register('gmat')} type="number" placeholder="e.g. 680" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">SAT</label>
                <Input {...register('sat')} type="number" placeholder="e.g. 1400" />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-3">Preferred Study Destinations</label>
                <div className="flex items-center gap-3 mb-4">
                  <input type="checkbox" id="open_to_all" {...register('open_to_all_destinations')} className="w-5 h-5 rounded text-primary" />
                  <label htmlFor="open_to_all" className="text-sm font-medium">I am open to more destinations (Any of the supported destinations)</label>
                </div>
                
                {!watch('open_to_all_destinations') && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Select your preferred countries:</p>
                    
                    {watchCountries.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {watchCountries.map(c => (
                          <span key={c} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold">
                            {c}
                            <button type="button" onClick={(e) => { e.stopPropagation(); toggleItem('countries', c); }} className="hover:text-indigo-900 dark:hover:text-indigo-100">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search for a country..." 
                        value={countrySearch} 
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="pl-9 mb-2"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border rounded-xl">
                      {ALL_DESTINATIONS
                        .filter(c => !watchCountries.includes(c) && c.toLowerCase().includes(countrySearch.toLowerCase()))
                        .map(c => (
                        <button
                          key={c} type="button"
                          onClick={() => { toggleItem('countries', c); setCountrySearch(''); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {watch('open_to_all_destinations') && (
                  <div className="space-y-2 mt-4">
                    <p className="text-xs text-red-500 font-semibold">Avoid these countries (Optional):</p>
                    
                    {watch('avoid_countries')?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {watch('avoid_countries').map(c => (
                          <span key={c} className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold">
                            {c}
                            <button type="button" onClick={(e) => { e.stopPropagation(); toggleItem('avoid_countries', c); }} className="hover:text-red-900 dark:hover:text-red-100">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search for a country to avoid..." 
                        value={avoidSearch} 
                        onChange={(e) => setAvoidSearch(e.target.value)}
                        className="pl-9 mb-2"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-red-100 dark:border-red-900/50 rounded-xl">
                      {ALL_DESTINATIONS
                        .filter(c => !(watch('avoid_countries') || []).includes(c) && c.toLowerCase().includes(avoidSearch.toLowerCase()))
                        .map(c => (
                        <button
                          key={c} type="button"
                          onClick={() => { toggleItem('avoid_countries', c); setAvoidSearch(''); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-red-300"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-3">Budget Preferences</label>
                
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" value="total" {...register('budget_mode')} className="w-4 h-4 text-primary" />
                    <span className="text-sm">Total Budget</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" value="detailed" {...register('budget_mode')} className="w-4 h-4 text-primary" />
                    <span className="text-sm">Detailed Budget</span>
                  </label>
                </div>

                {watch('budget_mode') === 'total' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Currency</label>
                      <select {...register('currency')} className="w-full p-2 rounded-lg border border-input text-sm bg-background">
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="PKR">PKR (₨)</option>
                        <option value="CAD">CAD ($)</option>
                        <option value="AUD">AUD ($)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Total Budget Amount</label>
                      <Input {...register('total_budget')} type="number" placeholder="e.g. 50000" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Period</label>
                      <select {...register('budget_period')} className="w-full p-2 rounded-lg border border-input text-sm bg-background">
                        <option value="per_year">Per Year</option>
                        <option value="full_degree">Full Degree</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Currency</label>
                      <select {...register('currency')} className="w-full p-2 rounded-lg border border-input text-sm bg-background">
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="PKR">PKR (₨)</option>
                        <option value="CAD">CAD ($)</option>
                        <option value="AUD">AUD ($)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Max Tuition Fee</label>
                      <Input {...register('max_course_tuition_fee')} type="number" placeholder="e.g. 30000" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Max Application Fee</label>
                      <Input {...register('max_application_fee')} type="number" placeholder="e.g. 100" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-dashed">
                <label className="block text-sm font-bold mb-3">Financial Needs</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 cursor-pointer">
                    <input type="checkbox" {...register('need_scholarship')} className="w-4 h-4 rounded text-primary" />
                    <span className="text-sm font-medium">Need Scholarship?</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 cursor-pointer">
                    <input type="checkbox" {...register('fully_funded_required')} className="w-4 h-4 rounded text-primary" />
                    <span className="text-sm font-medium">Fully Funded Required?</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-left">
            <h3 className="font-bold text-lg">Review Information</h3>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-sm space-y-4">
              
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Personal & Academic</h4>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <div><span className="text-gray-500">Name:</span> {watch('full_name') || 'N/A'}</div>
                  <div><span className="text-gray-500">Email:</span> {watch('email') || 'N/A'}</div>
                  <div><span className="text-gray-500">Home Country:</span> {watch('country') || 'N/A'}</div>
                  <div><span className="text-gray-500">Current Level:</span> {watch('current_degree_level') || 'N/A'}</div>
                  <div><span className="text-gray-500">Current Uni:</span> {watch('current_university') || 'N/A'}</div>
                  <div><span className="text-gray-500">CGPA:</span> {watch('cgpa') || 'N/A'}</div>
                  <div><span className="text-gray-500">Grad Year:</span> {watch('graduation_year') || 'N/A'}</div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Target Program</h4>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <div><span className="text-gray-500">Degree:</span> {watch('degree_applying_for') || 'N/A'}</div>
                  <div><span className="text-gray-500">Major:</span> {watch('intended_major') || 'N/A'}</div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Location & Financials</h4>
                <div className="grid grid-cols-1 gap-y-2">
                  <div>
                    <span className="text-gray-500">Destinations:</span> {
                      watch('open_to_all_destinations') ? "Open to all supported" : (watchCountries.length ? watchCountries.join(", ") : "None selected")
                    }
                  </div>
                  {watch('open_to_all_destinations') && watch('avoid_countries')?.length > 0 && (
                    <div><span className="text-gray-500">Avoiding:</span> {watch('avoid_countries').join(", ")}</div>
                  )}
                  <div>
                    <span className="text-gray-500">Budget:</span> {
                      watch('budget_mode') === 'total' && watch('total_budget') ? `${watch('total_budget')} ${watch('currency')} (${watch('budget_period')})` :
                      watch('budget_mode') === 'detailed' && watch('max_course_tuition_fee') ? `Max Tuition: ${watch('max_course_tuition_fee')} ${watch('currency')}` :
                      "Not specified"
                    }
                  </div>
                  <div>
                    <span className="text-gray-500">Funding Needed:</span> {
                      watch('fully_funded_required') ? "Fully Funded" : (watch('need_scholarship') ? "Scholarship Needed" : "No Preference")
                    }
                  </div>
                </div>
              </div>

            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
              <div className="h-8 w-8 shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-white mt-1">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-blue-600 uppercase tracking-widest mb-1">AI Match Processing</p>
                <p className="text-xs text-blue-800/70 dark:text-blue-300">Submit to securely match against our database. The AI will strictly follow your criteria and verify program availability.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row border border-gray-200/20">
        
        {/* Sidebar Navigation */}
        <div className="hidden md:flex w-64 bg-gray-50 dark:bg-gray-800/50 p-8 border-r border-gray-100 dark:border-gray-800 flex-col">
          <div className="mb-8">
            <h2 className="text-2xl font-black bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent italic">UniFinder AI</h2>
            <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mt-1">Smart Match System</p>
          </div>
          
          <div className="space-y-4 flex-1">
            {STEPS.map(step => (
              <div key={step.id} className={cn(
                "flex items-center gap-3 p-3 rounded-2xl transition-all",
                currentStep === step.id 
                  ? "bg-white dark:bg-gray-700 shadow-md shadow-gray-200/50 dark:shadow-none translate-x-2" 
                  : "opacity-40"
              )}>
                <div className={cn(
                  "p-2 rounded-xl",
                  currentStep === step.id ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-800"
                )}>
                  <step.icon className="h-4 w-4" />
                </div>
                <span className={cn("text-sm font-bold", currentStep === step.id ? "text-gray-900 dark:text-white" : "text-gray-500 line-through decoration-transparent")}>
                  {step.title}
                </span>
                {currentStep > step.id && <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />}
              </div>
            ))}
          </div>
          
          <div className="mt-auto">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-[10px] font-black text-indigo-500 uppercase mb-1">Progress</p>
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-xl font-bold">{STEPS[currentStep-1].title}</h3>
              <p className="text-xs text-gray-500">Step {currentStep} of {STEPS.length}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Pre-fill banner — source-aware (search history vs saved profile/preferences) */}
          {initialData && (
            <div className="mx-6 mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="h-8 w-8 shrink-0 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                <RotateCcw className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-indigo-700 dark:text-indigo-300">
                  {prefillSource === 'profile'
                    ? 'Some fields were pre-filled from your saved profile/preferences'
                    : 'Form pre-filled from your search history'}
                </p>
                <p className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-0.5">Review the details across all steps, then submit to get fresh recommendations.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar">
            {renderStep()}
          </form>

          <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between bg-gray-50 dark:bg-gray-800/20">
            <Button 
                type="button"
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1 || isLoading}
                className="gap-2 rounded-2xl px-8"
              >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            
            {currentStep === STEPS.length ? (
              <Button 
                type="button"
                className="gap-2 rounded-2xl px-12 bg-gradient-to-br from-indigo-500 to-purple-600 border-none hover:shadow-indigo-500/30"
                onClick={async () => {
                  const isValid = await trigger();
                  if (isValid) handleSubmit(handleFormSubmit)();
                }}
                isLoading={isLoading}
              >
                Generate My Recommendations <Sparkles className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="button"
                className="gap-2 rounded-2xl px-12"
                onClick={nextStep}
                disabled={isLoading}
              >
                Next Step <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Sparkles = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1-1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M21 17v4"/><path d="M19 19h4"/></svg>;

export default UniversityFinderModal;
