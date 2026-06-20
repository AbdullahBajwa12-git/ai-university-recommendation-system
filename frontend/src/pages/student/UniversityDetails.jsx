import React from 'react';
import { Heart, MapPin, Search, SlidersHorizontal, DollarSign, TrendingDown } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const unis = [
  {
    id: 1,
    name: 'University of Waterloo',
    country: 'Canada',
    rank: '154',
    fee: '42k',
    rate: '53%',
    image: 'https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 2,
    name: 'Northeastern University',
    country: 'USA',
    rank: '388',
    fee: '58k',
    rate: '18%',
    image: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 3,
    name: 'TU Munich',
    country: 'Germany',
    rank: '37',
    fee: '0',
    rate: '8%',
    image: 'https://images.unsplash.com/photo-1568249896073-63309f78326a?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 4,
    name: 'Imperial College London',
    country: 'UK',
    rank: '6',
    fee: '45k',
    rate: '14%',
    image: 'https://images.unsplash.com/photo-1532089006001-c854e99f43f8?auto=format&fit=crop&q=80&w=400',
  },
];

const UniversityDetails = () => {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Explore Universities</h2>
        <p className="text-gray-500 mt-1">Browse and filter from thousands of global institutions.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input placeholder="Search by name, country or field..." icon={Search} className="bg-gray-50 dark:bg-gray-900" />
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {unis.map((uni) => (
          <div
            key={uni.id}
            className="group bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={uni.image}
                alt={uni.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3">
                <button className="h-9 w-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                  <Heart className="h-4 w-4" />
                </button>
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="px-3 py-1 bg-white/90 text-xs font-bold rounded-lg text-gray-900">
                  QS #{uni.rank}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{uni.name}</h4>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <MapPin className="h-3 w-3" />{uni.country}
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-y border-dashed border-gray-100 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Tuition/yr</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">${uni.fee}</p>
                </div>
                <div className="text-center border-l border-gray-100 dark:border-gray-700 pl-4">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Acceptance</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">{uni.rate}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs">Details</Button>
                <Button size="sm" className="flex-1 rounded-xl text-xs">Programs</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="outline" className="rounded-full px-12 border-dashed">Load More Universities</Button>
      </div>
    </div>
  );
};

export default UniversityDetails;
