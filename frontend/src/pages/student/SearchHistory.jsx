import { useState, useEffect, useRef } from 'react';
import { History, Search, Download, FileText, Trash2, Clock, RotateCcw, Sparkles } from 'lucide-react';
import { useRecommendations } from '../../hooks/useRecommendations';
import { useSearchHistory } from '../../hooks/useSearchHistory';
import UniversityFinderModal from '../../components/modals/UniversityFinderModal';
import UniversityResultCard from '../../components/cards/UniversityResultCard';
import CompareModal from '../../components/modals/CompareModal';
import Button from '../../components/common/Button';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
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

const SearchHistory = () => {
    const {
        history,
        saved,
        getRecommendations,
        isGenerating,
        saveUniversity,
        unsaveUniversity,
        isSaving,
        savingUniversity,
        isUnsaving,
        unsavingSavedId,
        isLoadingHistory,
        getSessionDetails,
        deleteHistory,
        isDeletingHistory,
    } = useRecommendations();

    const { localHistory, saveToHistory, clearHistory } = useSearchHistory();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeResults, setActiveResults] = useState(null);
    const [activeHistorySessionId, setActiveHistorySessionId] = useState(null);
    const [comparingItems, setComparingItems] = useState([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
    const [prefillData, setPrefillData] = useState(null);
    const [prefillSource, setPrefillSource] = useState(null);
    const [loadingHistoryItem, setLoadingHistoryItem] = useState(null);
    const [historyTab, setHistoryTab] = useState('local');
    const [sessionToDelete, setSessionToDelete] = useState(null);
    const [deletingSessionId, setDeletingSessionId] = useState(null);
    const dialogRef = useRef(null);

    useEffect(() => {
        if (sessionToDelete) {
            dialogRef.current?.focus();

            const handleKeyDown = (e) => {
                if (e.key === 'Escape' && !deletingSessionId && !isDeletingHistory) {
                    setSessionToDelete(null);
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [sessionToDelete, deletingSessionId, isDeletingHistory]);

    const handleDeleteConfirm = async () => {
        if (!sessionToDelete) return;
        setDeletingSessionId(sessionToDelete.session_id);
        try {
            await deleteHistory(sessionToDelete.session_id);
            if (activeHistorySessionId === sessionToDelete.session_id) {
                setActiveResults(null);
                setActiveHistorySessionId(null);
            }
            setSessionToDelete(null);
        } catch {
            // Toast handles the error
        } finally {
            setDeletingSessionId(null);
        }
    };

    const handleFormSubmit = async (data) => {
        try {
            const results = await getRecommendations(data);
            if (results) {
                saveToHistory(data);
                setActiveResults(results);
                setActiveHistorySessionId(null);
                setIsModalOpen(false);
                setPrefillData(null);
                setPrefillSource(null);
            }
        } catch (error) {
            console.error("Failed to get recommendations:", error);
        }
    };

    const handleViewResults = async (session) => {
        setLoadingHistoryItem(session.session_id);
        try {
            const details = await getSessionDetails(session.session_id);
            setActiveResults(details);
            setActiveHistorySessionId(session.session_id);
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            import('react-hot-toast').then(({ toast }) => toast.error('Failed to load search history results'));
        } finally {
            setLoadingHistoryItem(null);
        }
    };

    const handleUseInputsAgain = async (e, session) => {
        e.stopPropagation();
        setLoadingHistoryItem(session.session_id);
        try {
            const details = await getSessionDetails(session.session_id);
            const historicalProfile = details.student_profile || {};

            const explicitData = {
                full_name: historicalProfile.full_name || '',
                email: historicalProfile.email || '',
                country: historicalProfile.country || '',
                current_degree_level: historicalProfile.current_degree_level || '',
                current_university: historicalProfile.current_university || '',
                cgpa: historicalProfile.cgpa || '',
                graduation_year: historicalProfile.graduation_year || '',
                degree_applying_for: historicalProfile.degree_applying_for || '',
                intended_major: historicalProfile.intended_major || '',
                ielts: historicalProfile.ielts || '',
                toefl: historicalProfile.toefl || '',
                gre: historicalProfile.gre || '',
                gmat: historicalProfile.gmat || '',
                sat: historicalProfile.sat || '',
                need_scholarship: Boolean(historicalProfile.need_scholarship),
                fully_funded_required: Boolean(historicalProfile.fully_funded_required),
                partial_scholarship_accepted: historicalProfile.partial_scholarship_accepted !== false,
                budget_max: historicalProfile.budget_max || '',
                continents: Array.isArray(historicalProfile.continents) ? historicalProfile.continents : [],
                countries: Array.isArray(historicalProfile.countries) ? historicalProfile.countries : [],
                public_only: Boolean(historicalProfile.public_only),
                private_allowed: historicalProfile.private_allowed !== false,
                research_focused: Boolean(historicalProfile.research_focused),
                industry_focused: Boolean(historicalProfile.industry_focused),
                top_ranked_only: Boolean(historicalProfile.top_ranked_only)
            };

            setPrefillData(explicitData);
            setPrefillSource('history');
            setIsModalOpen(true);
        } catch (error) {
            console.error(error);
            import('react-hot-toast').then(({ toast }) => toast.error('Failed to load search history inputs'));
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
        const dataToExport = activeResults?.recommended_universities || [];
        if (dataToExport.length === 0) return;

        doc.setFontSize(20);
        doc.text('University Recommendations Report', 20, 20);
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

        let y = 45;
        dataToExport.forEach((uni, i) => {
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
        doc.save('history_recommendations.pdf');
    };

    const exportToCSV = () => {
        const dataToExport = activeResults?.recommended_universities || [];
        if (dataToExport.length === 0) return;
        const headers = ['University', 'Country', 'Degree', 'Major', 'Admission Chance', 'Rank', 'Website'];
        const rows = dataToExport.map(u => [
            u.university_name, u.country, u.degree, u.major, u.admission_chance, u.world_rank, u.university_website
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, "history_universities.csv");
    };

    const safeHistory = Array.isArray(history) ? history : [];
    const sortedHistory = [...safeHistory].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const recentHistory = sortedHistory.slice(0, 5);

    const renderHistoryList = (list) => {
        if (isLoadingHistory) {
            return (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl" />)}
                </div>
            );
        }
        if (!list || list.length === 0) {
            return (
                <div className="text-center py-6">
                    <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="h-5 w-5 text-gray-300" />
                    </div>
                    <p className="text-xs text-gray-500 italic">No previous searches yet.</p>
                </div>
            );
        }
        return (
            <div className="space-y-2">
                {list.map(session => (
                    <article
                        key={session.session_id}
                        className="group relative flex flex-col gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                    >
                        {loadingHistoryItem === session.session_id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-800/70 rounded-xl z-10">
                                <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0 pr-8">
                            <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                                {session.intended_major || 'Any Major'} · {session.degree_applying_for || 'Any Degree'}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(session.created_at).toLocaleDateString()} • {session.total_count} results
                            </p>
                        </div>
                        <div className="flex gap-2 z-20">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleViewResults(session); }}
                                className="text-[10px] text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded font-bold transition-colors"
                            >
                                View Results
                            </button>
                            <button
                                type="button"
                                onClick={(e) => handleUseInputsAgain(e, session)}
                                className="text-[10px] text-indigo-600 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 px-3 py-1.5 rounded font-bold flex items-center gap-1 transition-colors"
                            >
                                <RotateCcw className="h-2.5 w-2.5" /> Use Inputs Again
                            </button>
                        </div>
                        <button
                            type="button"
                            aria-label="Delete history session"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSessionToDelete(session);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500 transition-all z-20"
                        >
                            {deletingSessionId === session.session_id ? (
                                <div className="h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                            )}
                        </button>
                    </article>
                ))}
            </div>
        );
    };

    return (
        <div className="relative space-y-8 p-8 pb-32 max-w-[1200px] mx-auto font-sans">
            {isGenerating && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="relative">
                        <div className="h-32 w-32 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <Sparkles className="absolute inset-0 m-auto h-12 w-12 text-primary animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black mt-8">AI is Analyzing Your Profile</h2>
                    <p className="text-gray-500 mt-2 text-lg text-center max-w-md">Scanning thousands of global universities...</p>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Search History</h1>
                <p className="text-gray-500 text-sm">Review your previous university search sessions.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Left Sidebar: Search History List */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <History className="h-4 w-4" /> History List
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

                        {historyTab === 'local' && renderHistoryList(recentHistory)}
                        {historyTab === 'remote' && renderHistoryList(safeHistory)}
                    </div>
                </div>

                {/* Right Side: Results */}
                <div className="xl:col-span-3 space-y-8">
                    {activeResults ? (
                        <>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                                <h3 className="font-bold text-gray-900">Historical Results</h3>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {activeResults.recommended_universities?.map((uni) => {
                                    const savedItem = saved.find((s) => isSameUniversity(s, uni));
                                    const isSaved = !!savedItem;
                                    const isBookmarkPending =
                                        (isSaving && savingUniversity && isSameUniversity(savingUniversity, uni)) ||
                                        (isUnsaving && unsavingSavedId === savedItem?.id);
                                    const cardKey = uni.id || uni.university_id || `${uni.university_name}-${uni.country}`;

                                    return (
                                        <UniversityResultCard
                                            key={cardKey}
                                            university={uni}
                                            onSave={() => saveUniversity({
                                                ...uni,
                                                session_id: activeResults.session_id || null
                                            })}
                                            onUnsave={() => {
                                                if (savedItem) unsaveUniversity(savedItem.id);
                                            }}
                                            isSaved={isSaved}
                                            isBookmarkPending={isBookmarkPending}
                                            showCompare={true}
                                            onCompareToggle={() => toggleCompare(uni)}
                                            isComparing={comparingItems.some(s => isSameUniversity(s, uni))}
                                        />
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="py-32 text-center bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700 h-full flex flex-col items-center justify-center">
                            <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
                                <History className="h-12 w-12 text-gray-400" />
                            </div>
                            <h2 className="text-3xl font-black mb-4">No Session Selected</h2>
                            <p className="text-gray-500 max-w-md mx-auto">Select a previous search from the list on the left to view its results, or use its inputs to run a new search.</p>
                        </div>
                    )}
                </div>
            </div>

            <UniversityFinderModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setPrefillData(null); setPrefillSource(null); }}
                onSubmit={handleFormSubmit}
                isLoading={isGenerating}
                initialData={prefillData}
                prefillSource={prefillSource}
            />

            <CompareModal
                isOpen={isCompareModalOpen}
                onClose={() => setIsCompareModalOpen(false)}
                universities={comparingItems}
            />

            {sessionToDelete && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 relative focus:outline-none"
                    >
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete History</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to permanently remove this recommendation history? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setSessionToDelete(null)} disabled={deletingSessionId !== null || isDeletingHistory}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleDeleteConfirm}
                                disabled={deletingSessionId !== null || isDeletingHistory}
                                className="bg-red-500 hover:bg-red-600 border-red-500 text-white min-w-[120px]"
                            >
                                {deletingSessionId !== null || isDeletingHistory ? (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                                ) : "Delete History"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default SearchHistory;
