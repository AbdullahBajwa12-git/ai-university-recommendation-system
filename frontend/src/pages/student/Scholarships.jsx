import { useState, useEffect } from 'react';
import { Award, Calendar, ArrowUpRight, Search, Loader2, AlertCircle, GraduationCap } from 'lucide-react';
import scholarshipService from '../../services/scholarshipService';

const Scholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await scholarshipService.getScholarships();
        if (active) setScholarships(Array.isArray(data) ? data : []);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? scholarships.filter((s) =>
        [s.title, s.provider, s.university_name, s.country, s.field_of_study, s.level]
          .filter(Boolean).some((v) => v.toLowerCase().includes(q)))
    : scholarships;

  return (
    <div className="max-w-[1200px] mx-auto w-full p-8 font-sans pb-20 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-serif text-[#111827] dark:text-white mb-2">Global Scholarships</h1>
          <p className="text-gray-500 mt-1">Funding opportunities curated by our team.</p>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 dark:text-gray-500 italic">
        Scholarship details are for guidance only. Always verify deadlines, eligibility, and funding on the
        official provider website.
      </p>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl pl-10 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 dark:text-gray-200"
            placeholder="Search by scholarship, provider, country or field..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24 text-gray-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
      )}

      {!loading && error && (
        <div className="py-20 text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Couldn't load scholarships</h3>
          <p className="text-gray-500 mt-1">Please check the backend is running and try again.</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="py-20 text-center">
          <Award className="h-10 w-10 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {scholarships.length === 0 ? 'No scholarships available yet' : 'No matches found'}
          </h3>
          <p className="text-gray-500 mt-1">
            {scholarships.length === 0 ? 'Please check back later.' : 'Try a different search term.'}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((sch) => (
            <div
              key={sch.id}
              className="group bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-6 right-6">
                <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Award className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-5 flex-1">
                <div>
                  {sch.country && <span className="text-[10px] font-black tracking-widest text-blue-600 uppercase">{sch.country}</span>}
                  <h4 className="text-xl font-black text-gray-900 dark:text-white leading-tight mt-1 max-w-[85%]">{sch.title}</h4>
                  <p className="text-sm font-medium text-gray-400 mt-1">{sch.provider || sch.university_name || '—'}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sch.level && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600">
                      <GraduationCap className="h-3 w-3" />{sch.level}
                    </span>
                  )}
                  {sch.field_of_study && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                      {sch.field_of_study}
                    </span>
                  )}
                  {sch.funding_type && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                      {sch.funding_type}
                    </span>
                  )}
                </div>

                {sch.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">{sch.description}</p>
                )}
                {sch.eligibility && (
                  <p className="text-xs text-gray-500 dark:text-gray-400"><span className="font-bold">Eligibility: </span>{sch.eligibility}</p>
                )}

                <div className="flex gap-6 py-5 border-y border-dashed border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Value</p>
                    <p className="font-bold text-gray-800 dark:text-white text-sm">{sch.amount || '—'}</p>
                  </div>
                  <div className="border-l border-gray-100 dark:border-gray-700 pl-6">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Deadline</p>
                    <p className="font-bold text-red-500 flex items-center gap-1.5 text-sm">
                      <Calendar className="h-3.5 w-3.5" />{sch.deadline || 'See website'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                {sch.apply_url ? (
                  <a
                    href={sch.apply_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                  >
                    Apply <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-3">Application link not available.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Scholarships;
