import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import {
  GraduationCap, Globe, DollarSign, Award, Save, ChevronRight, Loader2,
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { cn } from '../../utils/cn';
import profileService from '../../services/profileService';

const profileSchema = z.object({
  cgpa: z.string().optional(),
  ielts_score: z.string().optional(),
  gre_score: z.string().optional(),
  budget_max: z.string().optional(),
  preferred_study_level: z.string().optional(),
  degree: z.string().optional(),
  graduation_year: z.string().optional(),
  work_experience_months: z.string().optional(),
});

// Fields the form binds to (must match backend StudentProfile schema names).
const FORM_FIELDS = [
  'cgpa', 'ielts_score', 'gre_score', 'budget_max',
  'preferred_study_level', 'degree', 'graduation_year', 'work_experience_months',
];
// Fields the backend stores as float/int — sent as numbers, omitted when empty.
const NUMERIC_FIELDS = [
  'cgpa', 'ielts_score', 'gre_score', 'budget_max',
  'graduation_year', 'work_experience_months',
];

// Backend profile object → string-based form values (inputs need strings).
const toFormValues = (data) => {
  const out = {};
  FORM_FIELDS.forEach((f) => {
    const v = data?.[f];
    out[f] = v === null || v === undefined ? '' : String(v);
  });
  if (!out.preferred_study_level) out.preferred_study_level = 'Masters';
  return out;
};

// Form values → clean PUT payload: drop empties, coerce numeric fields to numbers.
const buildPayload = (data) => {
  const payload = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) return;
    if (NUMERIC_FIELDS.includes(key)) {
      const num = Number(value);
      if (!Number.isNaN(num)) payload[key] = num;
    } else {
      payload[key] = value;
    }
  });
  return payload;
};

const Profile = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { cgpa: '', preferred_study_level: 'Masters' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await profileService.getProfile();
        if (active) reset(toFormValues(data));
      } catch (err) {
        // 404 = no profile yet: leave the empty form as-is. Anything else is an error.
        if (active && err.response?.status !== 404) {
          toast.error('Failed to load profile');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const updated = await profileService.updateProfile(buildPayload(data));
      reset(toFormValues(updated));
      toast.success('Profile saved');
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Failed to save profile');
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Profile</h2>
          <p className="text-sm text-gray-500 mt-1">Keep your scores updated for accurate admission predictions.</p>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar nav */}
        <aside className="space-y-1">
          {[
            { label: 'Education Info', icon: GraduationCap, active: true },
            { label: 'Work Experience', icon: Globe, active: false },
            { label: 'Achievements', icon: Award, active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={cn(
                'flex w-full items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-colors',
                item.active
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800',
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
              {item.active && <ChevronRight className="h-4 w-4" />}
            </button>
          ))}
        </aside>

        {/* Form */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">
              General Background
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Cumulative GPA</label>
                <Input type="number" step="0.01" placeholder="3.85" error={errors.cgpa?.message} {...register('cgpa')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Study Level</label>
                <select
                  className="flex h-11 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  {...register('preferred_study_level')}
                >
                  <option>Bachelors</option>
                  <option>Masters</option>
                  <option>PhD</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Degree</label>
                <Input type="text" placeholder="B.Sc. Computer Science" {...register('degree')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Graduation Year</label>
                <Input type="number" placeholder="2024" {...register('graduation_year')} />
              </div>
            </div>

            <h4 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4 pt-4">
              Standardized Tests
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">IELTS Score</label>
                <Input placeholder="7.5" {...register('ielts_score')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">GRE Score</label>
                <Input placeholder="320" {...register('gre_score')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Max Budget ($/yr)</label>
                <Input type="number" icon={DollarSign} placeholder="50000" {...register('budget_max')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Work Experience (months)</label>
              <Input type="number" placeholder="12" {...register('work_experience_months')} />
            </div>
          </div>

          {/* AI Tip */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800 flex gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-xl h-fit">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h5 className="font-bold text-blue-700 dark:text-blue-300">AI Optimization Tip</h5>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 leading-relaxed">
                Add at least 2 extracurricular activities and work experience details to significantly improve your "Reach Schools" probability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
