import React from 'react';
import { Plus, Search, MapPin, Star, Globe, Edit, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';
import { cn } from '../../utils/cn';

const mockUnis = [
  { id: 1, name: 'University of Waterloo', country: 'Canada', rank: 154, city: 'Waterloo', website: 'uwaterloo.ca' },
  { id: 2, name: 'Northeastern University', country: 'USA', rank: 388, city: 'Boston', website: 'northeastern.edu' },
  { id: 3, name: 'TUM Munich', country: 'Germany', rank: 37, city: 'Munich', website: 'tum.de' },
];

const ManageUniversities = () => {
  return (
    <div className="space-y-8">
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Search universities by name, rank or location..."
          />
        </div>
        <Button size="sm" className="rounded-xl gap-2 h-11 px-8">
          <Plus className="h-4 w-4" /> Add University
        </Button>
      </div>

      <div className="bg-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-700">
                {['University', 'Location', 'QS Rank', 'Website', 'Actions'].map((h) => (
                  <th key={h} className="px-7 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {mockUnis.map((uni) => (
                <tr key={uni.id} className="hover:bg-slate-700/30 transition-all group">
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-black text-blue-400 text-sm">
                        {uni.name.charAt(0)}
                      </div>
                      <p className="font-bold text-white text-sm">{uni.name}</p>
                    </div>
                  </td>
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <MapPin className="h-3.5 w-3.5" /> {uni.city}, {uni.country}
                    </div>
                  </td>
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-bold text-white">#{uni.rank}</span>
                    </div>
                  </td>
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Globe className="h-3 w-3" />{uni.website}
                    </div>
                  </td>
                  <td className="px-7 py-5">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-7 py-5 bg-slate-900 border-t border-slate-700">
          <button className="text-sm font-bold text-blue-400 hover:underline flex items-center gap-2">
            Viewing 3 of 452 universities — Load All
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageUniversities;
