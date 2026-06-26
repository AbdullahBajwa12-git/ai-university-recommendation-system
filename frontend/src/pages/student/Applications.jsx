import React from 'react';
import {
  FileText, CheckCircle2, XCircle, Timer, MoreVertical, Plus, MapPin, Clock, ExternalLink,
} from 'lucide-react';
import Button from '../../components/common/Button';
import FutureScopeBanner from '../../components/common/FutureScopeBanner';
import { cn } from '../../utils/cn';

const apps = [
  {
    id: 1,
    uni: 'University of British Columbia',
    program: 'Master of Data Science',
    location: 'Vancouver, Canada',
    status: 'Pending',
    date: 'June 12, 2026',
    icon: Timer,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    id: 2,
    uni: 'ETH Zurich',
    program: 'MSc Computer Science',
    location: 'Zurich, Switzerland',
    status: 'Accepted',
    date: 'May 28, 2026',
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    id: 3,
    uni: 'National University of Singapore',
    program: 'Master of Computing',
    location: 'Singapore',
    status: 'Rejected',
    date: 'April 15, 2026',
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
];

const statusConfig = {
  Accepted: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Rejected: 'bg-red-50 text-red-600 border-red-200',
  Pending: 'bg-amber-50 text-amber-600 border-amber-200',
  Applied: 'bg-blue-50 text-blue-600 border-blue-200',
};

const Applications = () => {
  return (
    <div className="space-y-8 pb-12">
      <FutureScopeBanner message="Application tracking is a planned feature. The applications and statistics shown are sample data for demonstration and are not yet stored or tracked by the live system." />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Your Applications</h2>
          <p className="text-gray-500 mt-1">Track the status of all your university submissions.</p>
        </div>
        <Button className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Add Application
        </Button>
      </div>

      <div className="space-y-4">
        {apps.map((app) => (
          <div
            key={app.id}
            className="group bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-5 flex-1 min-w-0">
              <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center shrink-0', app.bg)}>
                <app.icon className={cn('h-7 w-7', app.color)} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">{app.uni}</h4>
                  <span className={cn('px-3 py-1 rounded-full text-xs font-bold border', statusConfig[app.status])}>
                    {app.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{app.program}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="h-3 w-3" />{app.location}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />Submitted {app.date}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-xl gap-2">
                View Details <ExternalLink className="h-3 w-3" />
              </Button>
              <button className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <MoreVertical className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
        {[
          { label: 'Success Rate', value: '33%', sub: '1 out of 3 applications' },
          { label: 'Avg. Response Time', value: '14 Days', sub: 'Across all schools' },
          { label: 'Next Deadline', value: 'July 15', sub: '31 days remaining', highlight: true },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{s.label}</p>
            <p className={cn('text-3xl font-black', s.highlight ? 'text-blue-600' : 'text-gray-900 dark:text-white')}>
              {s.value}
            </p>
            <p className="text-sm text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Applications;
