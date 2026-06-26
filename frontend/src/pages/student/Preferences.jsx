import React, { useState } from 'react';
import {
  Globe, BookOpen, GraduationCap, Wallet, X,
} from 'lucide-react';
import Button from '../../components/common/Button';
import FutureScopeBanner from '../../components/common/FutureScopeBanner';
import { cn } from '../../utils/cn';

const countries = ['USA', 'Canada', 'Germany', 'Australia', 'UK', 'Netherlands', 'Ireland', 'Sweden'];
const studyLevels = ['Bachelors', 'Masters', 'PhD'];
const fields = ['Computer Science', 'Data Science', 'Artificial Intelligence', 'Business Analytics', 'Electrical Engineering', 'Biotechnology'];

const Preferences = () => {
  const [selectedCountries, setSelectedCountries] = useState(['Canada', 'Germany']);
  const [selectedLevel, setSelectedLevel] = useState('Masters');
  const [selectedFields, setSelectedFields] = useState(['Computer Science']);
  const [budget, setBudget] = useState(45000);

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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <FutureScopeBanner message="Saved preferences are a planned feature. Selections here are not stored yet — use the Find Universities wizard to get live AI recommendations from your inputs." />
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Study Preferences</h2>
        <p className="text-gray-500 mt-1">Customize your preferences to refine AI recommendations.</p>
      </div>

      {/* Countries */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
            <Globe className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Target Countries</h4>
            <p className="text-sm text-gray-400">Select up to 5 countries.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {countries.map((c) => (
            <button
              key={c}
              onClick={() => toggleCountry(c)}
              className={cn(
                'px-4 py-3 border rounded-xl text-sm font-medium transition-all text-left',
                selectedCountries.includes(c)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300',
              )}
            >
              {c}
            </button>
          ))}
        </div>
        {selectedCountries.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedCountries.map((c) => (
              <span key={c} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-medium">
                {c}
                <button onClick={() => toggleCountry(c)}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Study Level + Field */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
              <GraduationCap className="h-5 w-5 text-purple-500" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Study Level</h4>
          </div>
          <div className="space-y-3">
            {studyLevels.map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLevel(l)}
                className={cn(
                  'flex w-full items-center gap-3 p-4 rounded-2xl border transition-all',
                  selectedLevel === l
                    ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300',
                )}
              >
                <div className={cn(
                  'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  selectedLevel === l ? 'border-purple-500' : 'border-gray-300',
                )}>
                  {selectedLevel === l && <div className="h-2.5 w-2.5 rounded-full bg-purple-500" />}
                </div>
                <span className="font-medium text-sm">{l}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <BookOpen className="h-5 w-5 text-emerald-500" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Fields of Interest</h4>
          </div>
          <div className="space-y-2">
            {fields.map((f) => (
              <button
                key={f}
                onClick={() => toggleField(f)}
                className={cn(
                  'flex w-full justify-between items-center px-4 py-3 rounded-xl border text-sm transition-all',
                  selectedFields.includes(f)
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-emerald-300',
                )}
              >
                {f}
                {selectedFields.includes(f) && <X className="h-3 w-3" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Budget */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
            <Wallet className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Annual Tuition Budget</h4>
            <p className="text-sm text-gray-400">Estimate your yearly capacity.</p>
          </div>
        </div>
        <div className="px-2">
          <input
            type="range" min="0" max="100000" step="1000"
            value={budget}
            onChange={(e) => setBudget(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between mt-4 text-sm font-medium text-gray-500">
            <span>$0</span>
            <span className="text-blue-600 text-lg font-bold">${budget.toLocaleString()}</span>
            <span>$100,000+</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="px-12 rounded-2xl">Update Recommendations</Button>
      </div>
    </div>
  );
};

export default Preferences;
