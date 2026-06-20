import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  GraduationCap, Globe, DollarSign, Award, Save, ChevronRight,
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { cn } from '../../utils/cn';

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

const Profile = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { cgpa: '', preferred_study_level: 'Masters' },
  });

  const onSubmit = (data) => {
    console.log('Saving Profile:', data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Profile</h2>
          <p className="text-sm text-gray-500 mt-1">Keep your scores updated for accurate admission predictions.</p>
        </div>
        <Button onClick={handleSubmit(onSubmit)} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
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
