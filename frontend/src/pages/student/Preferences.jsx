import { useState, useEffect } from 'react';
import {
  X, Loader2, ChevronDown, Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import { cn } from '../../utils/cn';
import profileService from '../../services/profileService';

const countriesList = [
  { name: 'UK', label: 'United Kingdom', code: 'gb' },
  { name: 'Canada', label: 'Canada', code: 'ca' },
  { name: 'Australia', label: 'Australia', code: 'au' },
  { name: 'Germany', label: 'Germany', code: 'de' },
  { name: 'USA', label: 'USA', code: 'us' },
  { name: 'Netherlands', label: 'Netherlands', code: 'nl' },
  { name: 'Ireland', label: 'Ireland', code: 'ie' },
  { name: 'Sweden', label: 'Sweden', code: 'se' }
];

const studyLevels = ['Bachelors', 'Master\'s degree', 'PhD'];
const fields = ['Computer Science', 'Data Science', 'Artificial Intelligence', 'Business Analytics', 'Electrical Engineering', 'Biotechnology', 'Cybersecurity', 'Software Engineering'];

const snapshotImage = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop";

const Preferences = () => {
  const navigate = useNavigate();
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("Master's degree");
  const [selectedFields, setSelectedFields] = useState([]);
  const [intendedMajor, setIntendedMajor] = useState('Computer Science');
  const [budget, setBudget] = useState(25000);
  const [scholarshipNeeded, setScholarshipNeeded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await profileService.getProfile();
        if (!active) return;

        setSelectedCountries(Array.isArray(data.preferred_countries) ? data.preferred_countries : []);

        let initialFields = Array.isArray(data.preferred_fields) ? data.preferred_fields : [];
        if (initialFields.length > 0) {
          setIntendedMajor(initialFields[0]);
          setSelectedFields(initialFields.slice(1));
        } else {
          setSelectedFields([]);
        }

        if (data.preferred_study_level) setSelectedLevel(data.preferred_study_level);
        if (data.budget_max != null) setBudget(data.budget_max);
      } catch (err) {
        if (active && err.response?.status !== 404) toast.error('Failed to load preferences');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const toggleCountry = (c) => {
    setSelectedCountries((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c].slice(0, 5),
    );
  };

  const toggleField = (f) => {
    setSelectedFields((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileService.updateProfile({
        preferred_study_level: selectedLevel,
        budget_max: Number(budget),
        preferred_countries: selectedCountries,
        preferred_fields: [intendedMajor, ...selectedFields],
      });
      toast.success('Preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const majorOptions = [...new Set([intendedMajor, ...fields])].filter(Boolean);

  return (
    <div className="max-w-[1200px] mx-auto w-full p-4 sm:p-6 lg:p-8 font-sans pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 lg:mb-8 gap-4">
        <div>
          <p className="text-blue-600 text-[11px] font-bold tracking-widest mb-2 uppercase">Shape your shortlist</p>
          <h2 className="text-4xl font-extrabold text-[#111827] tracking-tight font-serif mb-2">Study Preferences</h2>
          <p className="text-gray-500 text-sm">Tell us what matters most. You can adjust these choices in every search.</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#2596be] hover:bg-[#1e7a9c] text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all text-sm"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2 inline" /> : null}
          Save preferences
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Card 01: Academic direction */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">01</div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Academic direction</h3>
                  <p className="text-xs text-gray-500">Degree and subject preferences</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Target degree</label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer text-gray-700"
                      value={selectedLevel}
                      onChange={e => setSelectedLevel(e.target.value)}
                    >
                      {studyLevels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Intended major</label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer text-gray-700"
                      value={intendedMajor}
                      onChange={e => setIntendedMajor(e.target.value)}
                    >
                      {majorOptions.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-[11px] font-bold text-gray-700 mb-2">Areas of interest</label>
                <div className="flex flex-wrap gap-2">
                  {selectedFields.map(f => (
                    <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/70 text-blue-600 border border-blue-200/60 rounded-lg text-xs font-semibold">
                      {f}
                      <button onClick={() => toggleField(f)} className="hover:text-blue-800 focus:outline-none"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                  <div className="relative inline-block">
                    <select
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={e => {
                        if (e.target.value && !selectedFields.includes(e.target.value)) {
                          toggleField(e.target.value);
                        }
                        e.target.value = "";
                      }}
                    >
                      <option value="">Add</option>
                      {fields.filter(f => !selectedFields.includes(f) && f !== intendedMajor).map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-gray-600 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 pointer-events-none">
                      {selectedFields.length > 0 ? '+ Add more' : '+ Add interest'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 02: Destination choices */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">02</div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Destination choices</h3>
                  <p className="text-xs text-gray-500">Select up to five countries</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 flex-1">
                {countriesList.map(c => {
                  const isSelected = selectedCountries.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      onClick={() => toggleCountry(c.name)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-xl border text-[13px] font-semibold transition-all text-left",
                        isSelected
                          ? "border-blue-500 text-blue-700 bg-blue-50/30 ring-1 ring-blue-500"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      )}
                    >
                      <img src={`/flags/${c.code}.svg`} alt={c.label} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                      <span className="truncate">{c.label}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                {selectedCountries.length} of 5 selected · recommendations prioritise preferred destinations first.
              </p>
            </div>

            {/* Card 03: Budget and funding */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0">03</div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Budget and funding</h3>
                  <p className="text-xs text-gray-500">Annual affordability preferences</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Maximum annual tuition</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer text-gray-700"
                    value={budget}
                    onChange={e => setBudget(Number(e.target.value))}
                  >
                    <option value={15000}>USD 15,000 / year</option>
                    <option value={25000}>USD 25,000 / year</option>
                    <option value={35000}>USD 35,000 / year</option>
                    <option value={45000}>USD 45,000 / year</option>
                    <option value={55000}>USD 55,000 / year</option>
                    <option value={100000}>USD 100,000+ / year</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 items-end">
                <button
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all h-full",
                    scholarshipNeeded
                      ? "border-amber-300 bg-[#fffcf2]"
                      : "border-gray-200 bg-gray-50/50 hover:border-gray-300"
                  )}
                  onClick={() => setScholarshipNeeded(true)}
                >
                  <h4 className="font-bold text-gray-900 text-[13px] mb-1">Scholarship needed</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">Required to make study affordable</p>
                </button>
                <button
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all h-full",
                    !scholarshipNeeded
                      ? "border-gray-400 bg-white"
                      : "border-gray-200 bg-gray-50/50 hover:border-gray-300"
                  )}
                  onClick={() => setScholarshipNeeded(false)}
                >
                  <h4 className="font-bold text-gray-900 text-[13px] mb-1">Self-funded</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">Funding already available</p>
                </button>
              </div>
            </div>

            {/* Card 04: Decision priorities */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-sm shrink-0">04</div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Decision priorities</h3>
                  <p className="text-xs text-gray-500">Drag to reflect importance</p>
                </div>
              </div>

              <div className="space-y-2 flex-1">
                {[
                  { id: 1, text: "Program fit and entry eligibility", color: "text-blue-600 bg-blue-50" },
                  { id: 2, text: "Tuition and scholarship options", color: "text-emerald-600 bg-emerald-50" },
                  { id: 3, text: "University reputation", color: "text-amber-600 bg-amber-50" },
                  { id: 4, text: "Location and post-study opportunities", color: "text-pink-600 bg-pink-50" }
                ].map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-3 py-1.5 px-2">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold", item.color)}>
                      {idx + 1}
                    </div>
                    <span className="text-[13px] font-bold text-gray-800 flex-1">{item.text}</span>
                    <Menu className="h-4 w-4 text-gray-300 cursor-move" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar Snapshot */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden lg:sticky lg:top-8">
            <div className="relative h-[160px]">
              <img src={snapshotImage} alt="University" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/40 to-transparent"></div>
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-[#64ffda] text-[9px] font-bold tracking-widest mb-1.5 uppercase">PREFERENCE SNAPSHOT</p>
                <h3 className="text-white text-[19px] font-bold font-serif leading-tight">Your ideal study route</h3>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-medium text-gray-500">Degree</span>
                <span className="text-[13px] font-bold text-gray-900">{selectedLevel === "Master's degree" ? "Master's" : selectedLevel}</span>
              </div>
              <div className="h-px w-full bg-gray-100"></div>

              <div className="flex justify-between items-center">
                <span className="text-[13px] font-medium text-gray-500">Major</span>
                <span className="text-[13px] font-bold text-gray-900 text-right max-w-[150px] truncate">{intendedMajor || 'Not selected'}</span>
              </div>
              <div className="h-px w-full bg-gray-100"></div>

              <div className="flex justify-between items-center">
                <span className="text-[13px] font-medium text-gray-500">Destinations</span>
                <span className="text-[13px] font-bold text-gray-900">{selectedCountries.length} selected</span>
              </div>
              <div className="h-px w-full bg-gray-100"></div>

              <div className="flex justify-between items-center">
                <span className="text-[13px] font-medium text-gray-500">Budget</span>
                <span className="text-[13px] font-bold text-gray-900">≤ ${budget >= 1000 ? (budget / 1000) + 'k' : budget} / year</span>
              </div>
              <div className="h-px w-full bg-gray-100"></div>

              <div className="flex justify-between items-center">
                <span className="text-[13px] font-medium text-gray-500">Scholarship</span>
                <span className={cn("text-[13px] font-bold", scholarshipNeeded ? "text-amber-600" : "text-gray-900")}>
                  {scholarshipNeeded ? 'Required' : 'Self-funded'}
                </span>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => navigate('/find-universities')}
                  className="w-full py-2.5 rounded-xl bg-[#2596be] hover:bg-[#1e7a9c] text-white font-bold flex justify-center items-center gap-2 shadow-sm transition-all text-sm"
                >
                  Start UniFinder &rarr;
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-[#f8faff] p-5 rounded-2xl border border-blue-50/50">
            <p className="text-blue-600 text-xs font-bold mb-1.5">Tip</p>
            <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
              Wider destination choices usually produce a stronger shortlist without changing your academic priorities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
