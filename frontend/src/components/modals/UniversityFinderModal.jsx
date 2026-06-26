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

const STEPS = [
  { id: 1, title: 'Personal', icon: User },
  { id: 2, title: 'Academic', icon: GraduationCap },
  { id: 3, title: 'Target', icon: BrainCircuit },
  { id: 4, title: 'Scores', icon: Languages },
  { id: 5, title: 'Location', icon: MapPin },
  { id: 6, title: 'Prefs', icon: CheckCircle2 }
];

const UniversityFinderModal = ({ isOpen, onClose, onSubmit, isLoading, initialData, prefillSource }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const defaultVals = {
    continents: [],
    countries: [],
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

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: defaultVals,
  });

  // Re-populate form whenever initialData changes (new history item clicked)
  React.useEffect(() => {
    if (initialData) {
      reset({ ...defaultVals, ...initialData });
      setCurrentStep(1);
    }
  }, [initialData]); // eslint-disable-line

  if (!isOpen) return null;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFormSubmit = (data) => {
    onSubmit(data);
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

  const continents = ['North America', 'Europe', 'Asia', 'Australia', 'Africa'];
  const countries = [
    'USA', 'Canada', 'UK', 'Germany', 'Australia', 'Italy', 'France', 
    'Netherlands', 'Sweden', 'Norway', 'Finland', 'China', 'Japan', 
    'South Korea', 'Singapore'
  ];

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Full Name</label>
                <Input {...register('full_name', { required: 'Name is required' })} placeholder="Enter your full name" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Email</label>
                <Input {...register('email', { required: 'Email is required' })} type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Native Country</label>
                <Input {...register('country')} placeholder="Your current country" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Nationality</label>
                <Input {...register('nationality')} placeholder="Your nationality" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Current Degree Level</label>
                <select {...register('current_degree_level')} className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                  <option value="Intermediate">Intermediate</option>
                  <option value="Diploma">Diploma</option>
                  <option value="BS/Bachelor">BS/Bachelor</option>
                  <option value="MS/MPhil">MS/MPhil</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Current University</label>
                <Input {...register('current_university')} placeholder="University Name" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Current CGPA</label>
                <Input {...register('cgpa')} type="number" step="0.01" placeholder="e.g. 3.8" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Graduation Year</label>
                <Input {...register('graduation_year')} type="number" placeholder="e.g. 2025" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-xs">Total Credits</label>
                <Input {...register('total_credits')} type="number" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-xs">Semester</label>
                <Input {...register('current_semester')} type="number" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-xs">Year Gap</label>
                <Input {...register('year_gap')} type="number" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-xs">Publications</label>
                <Input {...register('num_publications')} type="number" placeholder="Number of publications" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-xs">Research Papers</label>
                <Input {...register('num_research_papers')} type="number" placeholder="Number of research papers" />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-lg font-bold">Target Study Level</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['BS', 'MS', 'MPhil', 'PhD'].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setValue('degree_applying_for', level)}
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
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Intended Major</label>
                <Input {...register('intended_major')} placeholder="e.g. Computer Science, Artificial Intelligence" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-xs">Research Experience</label>
                  <textarea 
                    {...register('research_experience')} 
                    className="w-full p-3 rounded-xl border border-input bg-background min-h-[80px] text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Briefly describe your research experience..."
                  ></textarea>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-xs">Work Experience</label>
                  <textarea 
                    {...register('work_experience')} 
                    className="w-full p-3 rounded-xl border border-input bg-background min-h-[80px] text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Briefly describe your work experience..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
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
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-3">Target Continents</label>
                <div className="flex flex-wrap gap-2">
                  {continents.map(c => (
                    <button
                      key={c} type="button"
                      onClick={() => toggleItem('continents', c)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                        watchContinents.includes(c) 
                          ? "bg-primary text-white border-primary" 
                          : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-3">Preferred Countries</label>
                <div className="flex flex-wrap gap-2">
                  {countries.map(c => (
                    <button
                        key={c} type="button"
                        onClick={() => toggleItem('countries', c)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                          watchCountries.includes(c) 
                            ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-200" 
                            : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500"
                        )}
                      >
                        {c}
                      </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-dashed">
                <label className="block text-sm font-bold mb-3">Financial Info</label>
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
            <h3 className="font-bold text-lg">Final Preferences</h3>
            <div className="space-y-3">
              {[
                { id: 'public_only', label: 'Public Universities Only', icon: Building2 },
                { id: 'research_focused', label: 'Research Focused Institutions', icon: Beaker },
                { id: 'industry_focused', label: 'Industry & Career Focused', icon: Briefcase },
                { id: 'top_ranked_only', label: 'Top Tier Ranked Universities Only', icon: Star }
              ].map(item => (
                <label key={item.id} className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-50 dark:border-gray-800 hover:border-primary/20 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {item.icon && <item.icon className="h-5 w-5" />}
                    </div>
                    <span className="font-bold text-sm">{item.label}</span>
                  </div>
                  <input type="checkbox" {...register(item.id)} className="w-5 h-5 rounded-md text-primary accent-primary" />
                </label>
              ))}
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black text-blue-600 uppercase tracking-widest mb-1">AI Recommendation</p>
                <p className="text-xs text-blue-800/70 dark:text-blue-300">Our AI will analyze your profile and preferences to find your dream universities. This may take 10-15 seconds.</p>
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
              <h3 className="text-xl font-bold">{STEPS[currentStep-1].title} Details</h3>
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
                onClick={handleSubmit(handleFormSubmit)}
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

// Additional icons not imported or needed
const Building2 = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>;
const Beaker = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>;
const Briefcase = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const Star = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const Sparkles = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M21 17v4"/><path d="M19 19h4"/></svg>;

export default UniversityFinderModal;
