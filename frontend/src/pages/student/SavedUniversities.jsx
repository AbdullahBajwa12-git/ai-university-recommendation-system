import { useState } from 'react';
import { useRecommendations } from '../../hooks/useRecommendations';
import UniversityResultCard from '../../components/cards/UniversityResultCard';
import CompareModal from '../../components/modals/CompareModal';
import Button from '../../components/common/Button';
import { Bookmark, RotateCcw, X, ArrowRightLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

const isSameUniversity = (a, b) => {
    if (a.university_id && b.university_id) {
        return a.university_id === b.university_id;
    }
    const normNameA = String(a.university_name || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const normNameB = String(b.university_name || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const normCountryA = String(a.country || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const normCountryB = String(b.country || '').trim().toLowerCase().replace(/\s+/g, ' ');
    return normNameA === normNameB && normCountryA === normCountryB;
};

const SavedUniversities = () => {
  const {
      saved,
      isLoadingSaved,
      isSavedError,
      refetchSaved,
      unsaveUniversity,
      isUnsaving,
      unsavingSavedId
  } = useRecommendations();

  const [comparingItems, setComparingItems] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const toggleCompare = (uni) => {
      const isAlreadyComparing = comparingItems.some(item => item.university_name === uni.university_name);
      if (isAlreadyComparing) {
          setComparingItems(prev => prev.filter(item => item.university_name !== uni.university_name));
      } else {
          if (comparingItems.length >= 3) {
              import('react-hot-toast').then(({ toast }) => toast.error('You can only compare up to 3 universities at a time.'));
              return;
          }
          setComparingItems(prev => [...prev, uni]);
      }
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full p-8 font-sans pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-2">
            Saved and Compare
          </h1>
          <p className="text-gray-500 text-lg">View your bookmarked universities and compare them side by side.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 mb-12">
        {/* Saved Button */}
        <button
          onClick={() => setShowSaved(!showSaved)}
          className={cn(
            "bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 transition-all flex flex-col justify-between w-full sm:w-64 text-left shadow-sm hover:shadow-xl hover:border-indigo-200 group",
            showSaved ? "border-indigo-500 ring-4 ring-indigo-50" : "border-gray-100 dark:border-gray-700"
          )}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 mb-6 group-hover:scale-110 transition-transform">
            <Bookmark className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{saved?.length || 0}</h3>
            <p className="text-base font-bold text-gray-900 dark:text-white">Saved Universities</p>
            <p className="text-sm text-gray-500 mt-1">Click to view bookmarks</p>
          </div>
        </button>

        {/* Compare Button */}
        <button
          onClick={() => {
              if (comparingItems.length === 0) {
                  import('react-hot-toast').then(({ toast }) => toast.error('Please select universities from your saved list to compare first.'));
                  return;
              }
              setIsCompareModalOpen(true);
          }}
          className={cn(
            "bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-gray-100 dark:border-gray-700 transition-all flex flex-col justify-between w-full sm:w-64 text-left shadow-sm hover:shadow-xl hover:border-emerald-200 group",
            comparingItems.length > 0 && "border-emerald-500"
          )}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/30 mb-6 group-hover:scale-110 transition-transform">
            <ArrowRightLeft className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{comparingItems.length}</h3>
            <p className="text-base font-bold text-gray-900 dark:text-white">Compare List</p>
            <p className="text-sm text-gray-500 mt-1">Select up to 3 to compare</p>
          </div>
        </button>
      </div>

      {showSaved && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Your Bookmarks</h2>
          </div>

          {isLoadingSaved ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-8 h-[400px] flex flex-col">
                          <div className="flex gap-4 mb-6">
                              <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                              <div className="flex-1 space-y-3">
                                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                              </div>
                          </div>
                          <div className="space-y-4 mb-8">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                          </div>
                          <div className="mt-auto grid grid-cols-3 gap-4">
                              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          </div>
                      </div>
                  ))}
              </div>
          ) : isSavedError ? (
              <div className="py-20 text-center bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700">
                  <div className="h-16 w-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Failed to load saved universities</h3>
                  <p className="text-gray-500 mb-6">There was a problem loading your bookmarks. Please try again.</p>
                  <Button onClick={() => refetchSaved()} className="mx-auto bg-gray-900 text-white dark:bg-gray-700">
                      <RotateCcw className="h-4 w-4 mr-2 inline" /> Retry
                  </Button>
              </div>
          ) : saved?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {saved.map((uni) => {
                const savedItem = uni;
                const isSaved = true;
                const isBookmarkPending = isUnsaving && unsavingSavedId === savedItem?.id;
                const cardKey = uni.id || uni.university_id || `${uni.university_name}-${uni.country}`;

                return (
                  <UniversityResultCard
                      key={cardKey}
                      university={uni}
                      onSave={() => {}}
                      onUnsave={() => unsaveUniversity(savedItem.id)}
                      isSaved={isSaved}
                      isBookmarkPending={isBookmarkPending}
                      showCompare={true}
                      onCompareToggle={() => toggleCompare(uni)}
                      isComparing={comparingItems.some(s => isSameUniversity(s, uni))}
                  />
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700">
                <div className="h-24 w-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bookmark className="h-12 w-12 text-gray-300" />
                </div>
                <h3 className="text-3xl font-black mb-4">No saved universities yet</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Your bookmarked universities will appear here. Return to Find Universities to discover and save your favorites.</p>
            </div>
          )}
        </div>
      )}

      <CompareModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          universities={comparingItems}
      />
    </div>
  );
};

export default SavedUniversities;
