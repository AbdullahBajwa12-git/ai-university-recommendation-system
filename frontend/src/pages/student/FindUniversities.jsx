import React, { useState } from 'react';
import { 
  Sparkles, History, Bookmark, Search,
  Download, FileText, BarChart3, ArrowRight,
  TrendingUp, SlidersHorizontal, Trash2, Clock, RotateCcw, X
} from 'lucide-react';
import { useRecommendations } from '../../hooks/useRecommendations';
import { useSearchHistory } from '../../hooks/useSearchHistory';
import UniversityFinderModal from '../../components/modals/UniversityFinderModal';
import UniversityResultCard from '../../components/cards/UniversityResultCard';
import CompareModal from '../../components/modals/CompareModal';
import Button from '../../components/common/Button';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { cn } from '../../utils/cn';

const FindUniversities = () => {
  const { 
    history, 
    saved, 
    getRecommendations, 
    isGenerating, 
    saveUniversity,
    unsaveUniversity, 
    isSaving,
    isLoadingHistory,
    isLoadingSaved,
    getSessionDetails,
  } = useRecommendations();

  const { localHistory, saveToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeResults, setActiveResults] = useState(null);
  const [comparingItems, setComparingItems] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('new'); // 'new', 'history', 'saved'
  const [prefillData, setPrefillData] = useState(null);  // form data from history
  const [loadingHistoryItem, setLoadingHistoryItem] = useState(null); // session_id being loaded
  const [historyTab, setHistoryTab] = useState('local'); // 'local' | 'remote'

  const handleFormSubmit = async (data) => {
    try {
      const results = await getRecommendations(data);
      if (results) {
        // ✅ Persist the inputs to localStorage history
        saveToHistory(data);
        setActiveResults(results);
        setViewMode('new');
        setIsModalOpen(false);
        setPrefillData(null);
      }
    } catch (error) {
      console.error("Failed to get recommendations:", error);
    }
  };

  // Open the modal pre-filled with a local history item
  const handleLocalHistoryClick = (entry) => {
    const profile = { ...entry.data };
    if (!Array.isArray(profile.continents)) profile.continents = [];
    if (!Array.isArray(profile.countries)) profile.countries = [];
    setPrefillData(profile);
    setIsModalOpen(true);
  };

  // Click a remote (API) history item → fetch full session → pre-fill the modal form
  const handleHistoryClick = async (session) => {
    setLoadingHistoryItem(session.session_id);
    try {
      const details = await getSessionDetails(session.session_id);
      const profile = details.student_profile || {};
      if (!Array.isArray(profile.continents)) profile.continents = [];
      if (!Array.isArray(profile.countries)) profile.countries = [];
      setPrefillData(profile);
      setActiveResults(details);
      setViewMode('new');
      setIsModalOpen(true);
    } catch (e) {
      import('react-hot-toast').then(({ toast }) => toast.error('Failed to load search history'));
    } finally {
      setLoadingHistoryItem(null);
    }
  };

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

  const exportToPDF = () => {
    const doc = new jsPDF();
    const dataToExport = activeResults?.recommended_universities || saved;
    
    doc.setFontSize(20);
    doc.text('University Recommendations Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    let y = 45;
    dataToExport?.forEach((uni, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`${i + 1}. ${uni.university_name} (${uni.country})`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`Degree: ${uni.degree} - Major: ${uni.major}`, 20, y + 7);
      doc.text(`Admission Chance: ${uni.admission_chance}%`, 20, y + 14);
      doc.text(`Description: ${uni.description?.slice(0, 80)}...`, 20, y + 21);
      y += 35;
    });
    
    doc.save('university_recommendations.pdf');
  };

  const exportToCSV = () => {
    const dataToExport = activeResults?.recommended_universities || saved;
    const headers = ['University', 'Country', 'Degree', 'Major', 'Admission Chance', 'Rank', 'Website'];
    const rows = dataToExport?.map(u => [
      u.university_name, u.country, u.degree, u.major, u.admission_chance, u.world_rank, u.university_website
    ]) || [];
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, "universities.csv");
  };

  const displayUniversities = () => {
    if (viewMode === 'new' && activeResults) return activeResults.recommended_universities || [];
    if (viewMode === 'saved') return saved || [];
    return [];
  };

  // Format a timestamp as a relative string
  const formatRelativeTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 2) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative space-y-8 pb-32">
      {/* AI Generating Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-500">
           <div className="relative">
              <div className="h-32 w-32 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto h-12 w-12 text-primary animate-pulse" />
           </div>
           <h2 className="text-3xl font-black mt-8 bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">AI is Analyzing Your Profile</h2>
           <p className="text-gray-500 mt-2 text-lg text-center max-w-md px-6">Scanning thousands of global universities to find your perfect matches. This usually takes 10-15 seconds.</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">Find Your Dream University</h1>
          <p className="text-gray-500 mt-2 text-lg">Personalized AI recommendations matched to your academic excellence.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setViewMode('saved')}
            className={cn("gap-2 rounded-2xl px-6", viewMode === 'saved' && "bg-primary/10 border-primary text-primary")}
          >
            <Bookmark className="h-4 w-4" /> Saved {saved.length > 0 && `(${saved.length})`}
          </Button>
          <Button 
            onClick={() => { setPrefillData(null); setIsModalOpen(true); }}
            className="gap-2 px-8 rounded-2xl shadow-xl shadow-primary/20 bg-gradient-to-br from-primary to-indigo-600"
          >
            <Sparkles className="h-5 w-5" /> Find Universities
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Search History */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700">
            {/* History Tab Toggle */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <History className="h-4 w-4" /> Search History
              </h3>
              {localHistory.length > 0 && historyTab === 'local' && (
                <button
                  onClick={clearHistory}
                  title="Clear all local history"
                  className="text-[10px] text-red-400 hover:text-red-600 font-bold uppercase tracking-wide flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            {/* Tab bar */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-4 gap-1">
              <button
                onClick={() => setHistoryTab('local')}
                className={cn(
                  "flex-1 text-[10px] font-black uppercase tracking-widest py-1.5 rounded-lg transition-all",
                  historyTab === 'local'
                    ? "bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Clock className="h-3 w-3 inline mr-1" />Recent
              </button>
              <button
                onClick={() => setHistoryTab('remote')}
                className={cn(
                  "flex-1 text-[10px] font-black uppercase tracking-widest py-1.5 rounded-lg transition-all",
                  historyTab === 'remote'
                    ? "bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <History className="h-3 w-3 inline mr-1" />All
              </button>
            </div>

            {/* LOCAL History Tab */}
            {historyTab === 'local' && (
              <>
                {localHistory.length > 0 ? (
                  <div className="space-y-2">
                    {localHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="group relative flex items-start gap-2 p-3 rounded-xl border border-transparent hover:border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer"
                        onClick={() => handleLocalHistoryClick(entry)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {entry.label}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {entry.data?.cgpa && (
                              <span className="text-[9px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full">
                                CGPA {entry.data.cgpa}
                              </span>
                            )}
                            {entry.data?.country && (
                              <span className="text-[9px] text-gray-400 font-medium">
                                {entry.data.country}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {formatRelativeTime(entry.timestamp)}
                          </p>
                          <p className="text-[10px] text-indigo-500 font-bold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <RotateCcw className="h-2.5 w-2.5" /> Re-fill form ↗
                          </p>
                        </div>
                        {/* Remove button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFromHistory(entry.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-300 hover:text-red-400"
                          title="Remove"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="h-5 w-5 text-gray-300" />
                    </div>
                    <p className="text-xs text-gray-500 italic">No searches yet.</p>
                    <p className="text-[10px] text-gray-400 mt-1">Your searches will appear here for quick re-use.</p>
                  </div>
                )}
              </>
            )}

            {/* REMOTE (API) History Tab */}
            {historyTab === 'remote' && (
              <>
                {isLoadingHistory ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl" />)}
                  </div>
                ) : history.length > 0 ? (
                  <div className="space-y-2">
                    {history.map(session => (
                      <button 
                        key={session.session_id} 
                        onClick={() => handleHistoryClick(session)}
                        disabled={loadingHistoryItem === session.session_id}
                        className="w-full text-left p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 border border-transparent transition-all group relative"
                      >
                        {loadingHistoryItem === session.session_id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-800/70 rounded-xl">
                            <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {session.intended_major || 'Any Major'} · {session.degree_applying_for || 'Any Degree'}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(session.created_at).toLocaleDateString()} • {session.total_count} results
                        </p>
                        <p className="text-[10px] text-indigo-400 font-bold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to restore & rerun ↗
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No previous searches yet.</p>
                )}
              </>
            )}
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-200 dark:shadow-none">
            <TrendingUp className="h-8 w-8 mb-4" />
            <h4 className="text-xl font-black leading-tight mb-2">Enhance admission chances by matching accurately</h4>
            <p className="text-xs text-indigo-100 mb-6">Our AI considers GPA, language test scores, and research papers for real-world accuracy.</p>
            <button className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition-colors">Learn How it Works</button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-8">
          
          {(activeResults || saved.length > 0 || viewMode === 'saved') ? (
            <>
              {/* Controls */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2">
                  <span className={cn(
                    "px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer",
                    viewMode === 'new' ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                  )} onClick={() => setViewMode('new')}>
                    Recent Results
                  </span>
                  <span className={cn(
                    "px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer",
                    viewMode === 'saved' ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                  )} onClick={() => setViewMode('saved')}>
                    Saved Bookmarks
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  {comparingItems.length > 0 && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="rounded-full px-6 gap-2 bg-emerald-500"
                      onClick={() => setIsCompareModalOpen(true)}
                    >
                      Compare ({comparingItems.length})
                    </Button>
                  )}
                  <div className="flex bg-gray-50 dark:bg-gray-900 rounded-xl p-1 border">
                    <button onClick={exportToPDF} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-all hover:shadow-sm">
                      <Download className="h-4 w-4" />
                    </button>
                    <button onClick={exportToCSV} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-all hover:shadow-sm">
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Credibility disclaimer */}
              <p className="text-xs text-gray-400 dark:text-gray-500 italic px-1">
                AI-assisted recommendations are for guidance only. Always verify admission requirements,
                deadlines, fees, and scholarships on the official university website.
              </p>

              {/* Grid of Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {displayUniversities().length > 0 ? (
                  displayUniversities().map((uni, idx) => (
                    <UniversityResultCard 
                      key={idx} 
                      university={uni} 
                      onSave={() => saveUniversity(uni)}
                      onUnsave={() => unsaveUniversity(uni.id)}
                      isSaved={saved.some(s => s.university_name === uni.university_name)}
                      isSaving={isSaving}
                      showCompare={true}
                      onCompareToggle={() => toggleCompare(uni)}
                      isComparing={comparingItems.some(s => s.university_name === uni.university_name)}
                    />
                  ))
                ) : (
                  <div className="md:col-span-2 py-20 text-center">
                    <div className="h-20 w-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No universities found here</h3>
                    <p className="text-gray-500 mb-8">Try searching for new recommendations or save your favorites.</p>
                  </div>
                )}
              </div>

            </>
          ) : (
            <div className="py-32 text-center bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700">
               <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Sparkles className="h-12 w-12 text-primary animate-pulse" />
               </div>
               <h2 className="text-3xl font-black mb-4">You haven't run a search yet</h2>
               <p className="text-gray-500 mb-10 max-w-md mx-auto">Complete our 6-step wizard to see AI-powered university matches tailored exactly to your profile.</p>
               <Button 
                onClick={() => { setPrefillData(null); setIsModalOpen(true); }}
                className="rounded-2xl px-12 h-14 text-lg bg-gradient-to-br from-primary to-indigo-600 shadow-2xl shadow-primary/30"
               >
                Start Free Evaluation
               </Button>
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      <UniversityFinderModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setPrefillData(null); }} 
        onSubmit={handleFormSubmit}
        isLoading={isGenerating}
        initialData={prefillData}
      />

      <CompareModal 
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        universities={comparingItems}
      />
    </div>
  );
};

export default FindUniversities;
