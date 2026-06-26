import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Search, SlidersHorizontal, DollarSign, TrendingDown, Loader2, AlertCircle, School } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import universityService from '../../services/universityService';

/* ── Display helpers (safe fallbacks for missing backend fields) ── */
const initialsOf = (name) =>
  name ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '??';

const fmtTuition = (fee) => {
  if (fee === 0) return 'Free';
  if (fee == null) return 'Not available';
  return `$${fee.toLocaleString()}`;
};

const fmtRate = (r) => (r == null ? 'N/A' : `${r}%`);

const UniversityDetails = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await universityService.getUniversities();
        if (active) setUniversities(Array.isArray(data) ? data : []);
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
    ? universities.filter((u) =>
        [u.university_name, u.country, u.city]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(q)))
    : universities;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Explore Universities</h2>
        <p className="text-gray-500 mt-1">Browse and filter from global institutions.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, country or city..."
            icon={Search}
            className="bg-gray-50 dark:bg-gray-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-dashed">
            <MapPin className="h-4 w-4" /> Country
          </Button>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-dashed">
            <DollarSign className="h-4 w-4" /> Tuition
          </Button>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-dashed">
            <TrendingDown className="h-4 w-4" /> Acceptance
          </Button>
          <Button variant="secondary" size="sm" className="gap-2 rounded-xl">
            <SlidersHorizontal className="h-4 w-4" /> More Filters
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="py-20 text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Couldn't load universities</h3>
          <p className="text-gray-500 mt-1">Please check the backend is running and try again.</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="py-20 text-center">
          <School className="h-10 w-10 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {universities.length === 0 ? 'No universities available yet' : 'No matches found'}
          </h3>
          <p className="text-gray-500 mt-1">
            {universities.length === 0
              ? 'The catalog is empty. Seed demo universities to populate it.'
              : 'Try a different search term.'}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((uni) => (
            <div
              key={uni.id}
              className="group bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
            >
              <div className="relative h-44 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-4xl font-black text-white/90 group-hover:scale-110 transition-transform">
                  {initialsOf(uni.university_name)}
                </span>
                <div className="absolute top-3 right-3">
                  <button className="h-9 w-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                {uni.qs_ranking != null && (
                  <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1 bg-white/90 text-xs font-bold rounded-lg text-gray-900">
                      QS #{uni.qs_ranking}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{uni.university_name || 'Not available'}</h4>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <MapPin className="h-3 w-3" />{[uni.city, uni.country].filter(Boolean).join(', ') || 'Not available'}
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-y border-dashed border-gray-100 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-gray-400">Tuition/yr</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{fmtTuition(uni.yearly_tuition_fee)}</p>
                  </div>
                  <div className="text-center border-l border-gray-100 dark:border-gray-700 pl-4">
                    <p className="text-[10px] font-bold uppercase text-gray-400">Acceptance</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{fmtRate(uni.acceptance_rate)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {uni.website ? (
                    <a
                      href={uni.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center rounded-xl text-xs font-semibold h-9 px-3 border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Visit Website
                    </a>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs" disabled>Website</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniversityDetails;
