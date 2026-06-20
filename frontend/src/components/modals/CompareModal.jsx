import React from 'react';
import { X, Trophy, Check, MapPin, GraduationCap, DollarSign, BrainCircuit } from 'lucide-react';
import { cn } from '../../utils/cn';

const CompareModal = ({ isOpen, onClose, universities }) => {
  if (!isOpen) return null;

  const features = [
    { label: 'Admission Chance', key: 'admission_chance', suffix: '%' },
    { label: 'World Rank', key: 'world_rank', prefix: '#' },
    { label: 'Country', key: 'country' },
    { label: 'Degree', key: 'degree' },
    { label: 'Intended Major', key: 'major' },
    { label: 'Scholarship', key: 'scholarship_available', isBoolean: true }
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-6xl max-h-[85vh] overflow-hidden rounded-[3rem] shadow-2xl flex flex-col border border-white/10">
        <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-2xl font-black italic">University Comparison</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Side-by-side analysis</p>
          </div>
          <button 
            onClick={onClose}
            className="h-12 w-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center hover:scale-110 transition-all border border-gray-100 dark:border-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-x-auto p-8 custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-6 text-left min-w-[200px] border-b-2 border-gray-50 dark:border-gray-800">
                  <div className="text-[10px] uppercase font-black text-primary tracking-widest bg-primary/5 p-2 rounded-lg inline-block">Comparison Metric</div>
                </th>
                {universities.map((uni, idx) => (
                  <th key={idx} className="p-6 text-center min-w-[280px] border-b-2 border-gray-50 dark:border-gray-800">
                    <div className="space-y-4">
                      <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-indigo-200">
                        {uni.university_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <h4 className="text-lg font-bold leading-tight line-clamp-2">{uni.university_name}</h4>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, fIdx) => (
                <tr key={fIdx} className="group">
                  <td className="p-6 text-left font-black text-gray-400 uppercase text-[10px] tracking-widest border-b border-gray-50 dark:border-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/20 transition-colors">
                    {feature.label}
                  </td>
                  {universities.map((uni, uIdx) => (
                    <td key={uIdx} className="p-6 text-center border-b border-gray-50 dark:border-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/20 transition-colors">
                      {feature.isBoolean ? (
                        <div className="flex justify-center">
                          {uni[feature.key] ? (
                            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                              <Check className="h-5 w-5" />
                            </div>
                          ) : (
                             <div className="h-8 w-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                              <X className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className={cn(
                          "text-base font-bold",
                          feature.key === 'admission_chance' ? "text-primary text-xl" : "text-gray-700 dark:text-gray-300"
                        )}>
                          {feature.prefix || ''}{uni[feature.key] || 'N/A'}{feature.suffix || ''}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-6 border-b border-gray-50 dark:border-gray-800" />
                {universities.map((uni, uIdx) => (
                  <td key={uIdx} className="p-6 text-center border-b border-gray-50 dark:border-gray-800">
                    <a 
                      href={uni.university_website} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest hover:underline"
                    >
                      Visit Site <X className="h-3 w-3 rotate-45" />
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="p-8 bg-gray-50 dark:bg-gray-800/30 text-center">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest italic">Powered by AI University Advisor Intelligence</p>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
