import React from 'react';
import { Award, MapPin, Calendar, ArrowUpRight, Filter, Search } from 'lucide-react';
import Button from '../../components/common/Button';

const scholarships = [
  {
    id: 1,
    name: 'Lester B. Pearson Scholarship',
    school: 'University of Toronto',
    amount: 'Full Ride + Living',
    deadline: 'Dec 15, 2026',
    country: 'Canada',
  },
  {
    id: 2,
    name: 'Knight-Hennessy Scholars',
    school: 'Stanford University',
    amount: 'Full Funding',
    deadline: 'Oct 08, 2026',
    country: 'USA',
  },
  {
    id: 3,
    name: 'DAAD Scholarship',
    school: 'Various German Universities',
    amount: 'Full Tuition',
    deadline: 'Jul 31, 2026',
    country: 'Germany',
  },
  {
    id: 4,
    name: 'Erasmus Mundus Joint Masters',
    school: 'Multi-institutional (EU)',
    amount: 'Full Ride',
    deadline: 'Mar 01, 2027',
    country: 'Europe',
  },
];

const Scholarships = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Global Scholarships</h2>
          <p className="text-gray-500 mt-1">Funding opportunities matched to your academic profile.</p>
        </div>
        <Button className="gap-2 rounded-xl">Check Eligibility</Button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl pl-10 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 dark:text-gray-200"
            placeholder="Search by scholarship name or country..."
          />
        </div>
        <Button variant="outline" className="rounded-xl gap-2 border-dashed text-gray-500">
          <Filter className="h-4 w-4" /> Filter by Deadline
        </Button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scholarships.map((sch) => (
          <div
            key={sch.id}
            className="group bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 relative overflow-hidden"
          >
            {/* Top right icon */}
            <div className="absolute top-6 right-6">
              <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Award className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-black tracking-widest text-blue-600 uppercase">{sch.country}</span>
                <h4 className="text-xl font-black text-gray-900 dark:text-white leading-tight mt-1 max-w-[80%]">{sch.name}</h4>
                <p className="text-sm font-medium text-gray-400 mt-1">{sch.school}</p>
              </div>

              <div className="flex gap-6 py-5 border-y border-dashed border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Value</p>
                  <p className="font-bold text-gray-800 dark:text-white text-sm">{sch.amount}</p>
                </div>
                <div className="border-l border-gray-100 dark:border-gray-700 pl-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Deadline</p>
                  <p className="font-bold text-red-500 flex items-center gap-1.5 text-sm">
                    <Calendar className="h-3.5 w-3.5" />{sch.deadline}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[9px] font-bold text-gray-500">
                      U
                    </div>
                  ))}
                  <span className="ml-3 pt-1 text-xs text-gray-400 font-medium">+4 applied</span>
                </div>
                <button className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white text-gray-500 transition-all">
                  <ArrowUpRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scholarships;
