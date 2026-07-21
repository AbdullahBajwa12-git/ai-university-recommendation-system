import { useState, useEffect, useRef } from 'react';
import {
    History, Search, Download, FileText, Trash2, Clock,
    RotateCcw, Sparkles, Calendar, BookOpen, TrendingUp,
    ChevronDown, ChevronUp, X, GraduationCap, Globe
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

const isSameUniversity = (a, b) => {
    if (a.university_id && b.university_id) return a.university_id === b.university_id;
    const nA = String(a.university_name || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const nB = String(b.university_name || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const cA = String(a.country || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const cB = String(b.country || '').trim().toLowerCase().replace(/\s+/g, ' ');
    return nA === nB && cA === cB;
};

const SearchHistory = () => {
    const {
        history, saved, getRecommendations, isGenerating,
        saveUniversity, unsaveUniversity,
        isSaving, savingUniversity,
        isUnsaving, unsavingSavedId,
        isLoadingHistory, getSessionDetails,
        deleteHistory, isDeletingHistory,
    } = useRecommendations();

    const { localHistory, saveToHistory, clearHistory } = useSearchHistory();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedSession, setExpandedSession] = useState(null);     // session_id of open accordion
    const [activeResults, setActiveResults] = useState(null);         // results for expanded session
    const [comparingItems, setComparingItems] = useState([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
    const [prefillData, setPrefillData] = useState(null);
    const [prefillSource, setPrefillSource] = useState(null);
    const [loadingHistoryItem, setLoadingHistoryItem] = useState(null);
    const [historyTab, setHistoryTab] = useState('remote');
    const [sessionToDelete, setSessionToDelete] = useState(null);
    const [deletingSessionId, setDeletingSessionId] = useState(null);
    const dialogRef = useRef(null);

    useEffect(() => {
        if (!sessionToDelete) return;
        dialogRef.current?.focus();
        const handleKey = (e) => {
            if (e.key === 'Escape' && !deletingSessionId && !isDeletingHistory) setSessionToDelete(null);
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [sessionToDelete, deletingSessionId, isDeletingHistory]);

    /* ── helpers ── */
    const handleDeleteConfirm = async () => {
        if (!sessionToDelete) return;
        setDeletingSessionId(sessionToDelete.session_id);
        try {
            await deleteHistory(sessionToDelete.session_id);
            if (expandedSession === sessionToDelete.session_id) {
                setExpandedSession(null);
                setActiveResults(null);
            }
            setSessionToDelete(null);
        } catch { /* toast handles */ }
        finally { setDeletingSessionId(null); }
    };

    const handleFormSubmit = async (data) => {
        try {
            const results = await getRecommendations(data);
            if (results) {
                saveToHistory(data);
                setActiveResults(results);
                setExpandedSession('new');
                setIsModalOpen(false);
                setPrefillData(null); setPrefillSource(null);
            }
        } catch (err) { console.error(err); }
    };

    const handleToggleSession = async (session) => {
        // collapse if already open
        if (expandedSession === session.session_id) {
            setExpandedSession(null);
            setActiveResults(null);
            return;
        }
        setLoadingHistoryItem(session.session_id);
        try {
            const details = await getSessionDetails(session.session_id);
            setActiveResults(details);
            setExpandedSession(session.session_id);
        } catch {
            import('react-hot-toast').then(({ toast }) => toast.error('Failed to load results'));
        } finally { setLoadingHistoryItem(null); }
    };

    const handleUseInputsAgain = async (e, session) => {
        e.stopPropagation();
        setLoadingHistoryItem(session.session_id);
        try {
            const details = await getSessionDetails(session.session_id);
            const p = details.student_profile || {};
            setPrefillData({
                full_name: p.full_name || '', email: p.email || '',
                country: p.country || '', current_degree_level: p.current_degree_level || '',
                current_university: p.current_university || '', cgpa: p.cgpa || '',
                graduation_year: p.graduation_year || '', degree_applying_for: p.degree_applying_for || '',
                intended_major: p.intended_major || '', ielts: p.ielts || '',
                toefl: p.toefl || '', gre: p.gre || '', gmat: p.gmat || '', sat: p.sat || '',
                need_scholarship: Boolean(p.need_scholarship),
                fully_funded_required: Boolean(p.fully_funded_required),
                partial_scholarship_accepted: p.partial_scholarship_accepted !== false,
                budget_max: p.budget_max || '',
                continents: Array.isArray(p.continents) ? p.continents : [],
                countries: Array.isArray(p.countries) ? p.countries : [],
                public_only: Boolean(p.public_only),
                private_allowed: p.private_allowed !== false,
                research_focused: Boolean(p.research_focused),
                industry_focused: Boolean(p.industry_focused),
                top_ranked_only: Boolean(p.top_ranked_only),
            });
            setPrefillSource('history');
            setIsModalOpen(true);
        } catch {
            import('react-hot-toast').then(({ toast }) => toast.error('Failed to load inputs'));
        } finally { setLoadingHistoryItem(null); }
    };

    const toggleCompare = (uni) => {
        const already = comparingItems.some(i => i.university_name === uni.university_name);
        if (already) { setComparingItems(p => p.filter(i => i.university_name !== uni.university_name)); return; }
        if (comparingItems.length >= 3) {
            import('react-hot-toast').then(({ toast }) => toast.error('Max 3 universities to compare.'));
            return;
        }
        setComparingItems(p => [...p, uni]);
    };

    const exportToPDF = () => {
        const data = activeResults?.recommended_universities || [];
        if (!data.length) return;
        const doc = new jsPDF();
        doc.setFontSize(20); doc.text('University Recommendations Report', 20, 20);
        doc.setFontSize(12); doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
        let y = 45;
        data.forEach((uni, i) => {
            if (y > 270) { doc.addPage(); y = 20; }
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
        const data = activeResults?.recommended_universities || [];
        if (!data.length) return;
        const headers = ['University', 'Country', 'Degree', 'Major', 'Admission Chance', 'Rank', 'Website'];
        const rows = data.map(u => [u.university_name, u.country, u.degree, u.major, u.admission_chance, u.world_rank, u.university_website]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'history_universities.csv');
    };

    /* ── data ── */
    const safeHistory = Array.isArray(history) ? history : [];
    const sortedHistory = [...safeHistory].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const displayList = historyTab === 'local' ? sortedHistory.slice(0, 5) : sortedHistory;

    const totalSearches = safeHistory.length;
    const totalResults = safeHistory.reduce((s, h) => s + (h.total_count || 0), 0);
    const lastCount = sortedHistory[0]?.total_count || 0;

    /* ── skeleton ── */
    const SkeletonCard = () => (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 animate-pulse">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
                </div>
                <div className="h-8 w-24 bg-gray-100 dark:bg-gray-700 rounded-xl" />
            </div>
        </div>
    );

    return (
        <div className="relative max-w-[1100px] mx-auto w-full p-4 sm:p-6 md:p-8 pb-32 font-sans">

            {/* ── AI Generating Overlay ── */}
            {isGenerating && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="relative">
                        <div className="h-32 w-32 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto h-12 w-12 text-blue-600 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black mt-8 text-gray-900 dark:text-white">AI is Analyzing Your Profile</h2>
                    <p className="text-gray-500 mt-2 text-lg text-center max-w-md">Scanning thousands of global universities…</p>
                </div>
            )}

            {/* ── Hero Banner ── */}
            <div className="relative rounded-3xl overflow-hidden mb-8 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-teal-900" />
                <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '24px 24px' }}
                />
                <div className="relative z-10 p-6 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <p className="text-blue-400 font-bold text-xs tracking-widest uppercase mb-2 flex items-center gap-1.5">
                                <History className="h-3 w-3" /> AI Search History
                            </p>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight font-serif">
                                Search History
                            </h1>
                            <p className="text-gray-300 text-sm">
                                Revisit your past university recommendation sessions.
                            </p>
                        </div>
                        {/* Stats */}
                        <div className="flex gap-3 flex-wrap">
                            {[
                                { label: 'Searches', value: totalSearches, color: 'text-blue-300' },
                                { label: 'Matched', value: totalResults, color: 'text-teal-300' },
                                { label: 'Last Run', value: lastCount, color: 'text-amber-300' },
                            ].map(s => (
                                <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center min-w-[82px]">
                                    <p className="text-2xl font-black text-white">{s.value}</p>
                                    <p className={cn('text-[10px] font-bold uppercase tracking-widest mt-0.5', s.color)}>{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tab bar + Clear ── */}
            <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
                {/* Tabs */}
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1 w-fit">
                    {[
                        { key: 'remote', label: 'All Searches', icon: History },
                        { key: 'local', label: 'Recent (5)', icon: Clock },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setHistoryTab(t.key)}
                            className={cn(
                                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all',
                                historyTab === t.key
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            )}
                        >
                            <t.icon className="h-3.5 w-3.5" /> {t.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {localHistory.length > 0 && historyTab === 'local' && (
                        <button
                            onClick={clearHistory}
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-bold transition-colors"
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Clear Recent
                        </button>
                    )}
                    <span className="text-xs text-gray-400 font-medium">{displayList.length} session{displayList.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* ── Session List ── */}
            {isLoadingHistory ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : displayList.length === 0 ? (
                /* ── Empty State ── */
                <div className="flex flex-col items-center justify-center py-28 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 border border-blue-100 dark:border-blue-800 flex items-center justify-center mb-6">
                        <History className="h-9 w-9 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-white">No Searches Yet</h2>
                    <p className="text-gray-400 text-sm max-w-sm text-center leading-relaxed">
                        Your AI recommendation sessions will appear here once you run a search.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {displayList.map(session => {
                        const isOpen = expandedSession === session.session_id;
                        const isLoading = loadingHistoryItem === session.session_id;
                        const date = new Date(session.created_at);

                        return (
                            <div
                                key={session.session_id}
                                className={cn(
                                    'bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 overflow-hidden',
                                    isOpen
                                        ? 'border-blue-300 dark:border-blue-700 shadow-lg shadow-blue-50 dark:shadow-blue-900/10'
                                        : 'border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md'
                                )}
                            >
                                {/* ── Session Row (always visible) ── */}
                                <div
                                    className="flex items-center gap-4 p-4 md:p-5 cursor-pointer select-none"
                                    onClick={() => handleToggleSession(session)}
                                >
                                    {/* Icon */}
                                    <div className={cn(
                                        'h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                                        isOpen
                                            ? 'bg-gradient-to-br from-blue-600 to-teal-500 shadow-md shadow-blue-200'
                                            : 'bg-blue-50 dark:bg-blue-900/30'
                                    )}>
                                        <GraduationCap className={cn('h-5 w-5', isOpen ? 'text-white' : 'text-blue-500')} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                                            {session.intended_major || 'Any Major'}
                                            <span className="mx-1.5 text-gray-300">·</span>
                                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                                {session.degree_applying_for || 'Any Degree'}
                                            </span>
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                                <Calendar className="h-3 w-3" />
                                                {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                                                <TrendingUp className="h-2.5 w-2.5" />
                                                {session.total_count} results
                                            </span>
                                            {session.country && (
                                                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                                    <Globe className="h-3 w-3" /> {session.country}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={(e) => handleUseInputsAgain(e, session)}
                                            disabled={isLoading}
                                            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-2 rounded-xl transition-colors"
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" /> Reuse
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSessionToDelete(session); }}
                                            disabled={isLoading}
                                            className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                        >
                                            {deletingSessionId === session.session_id
                                                ? <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                                : <Trash2 className="h-4 w-4" />}
                                        </button>
                                        <div className={cn(
                                            'h-8 w-8 rounded-xl flex items-center justify-center transition-all',
                                            isOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                        )}>
                                            {isLoading
                                                ? <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                : isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    </div>
                                </div>

                                {/* ── Expanded Results Panel ── */}
                                {isOpen && activeResults && (
                                    <div className="border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2 duration-300">
                                        {/* Results toolbar */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 bg-gray-50/60 dark:bg-gray-800/60">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-blue-500" />
                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                                    {activeResults?.recommended_universities?.length || 0} Universities Found
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {comparingItems.length > 0 && (
                                                    <button
                                                        onClick={() => setIsCompareModalOpen(true)}
                                                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-3 py-2 rounded-xl shadow-sm transition-all"
                                                    >
                                                        Compare ({comparingItems.length})
                                                    </button>
                                                )}
                                                {/* mobile reuse */}
                                                <button
                                                    onClick={(e) => handleUseInputsAgain(e, session)}
                                                    className="sm:hidden flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors"
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5" /> Reuse
                                                </button>
                                                <div className="flex bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-100 dark:border-gray-700 gap-0.5">
                                                    <button onClick={exportToPDF} title="Export PDF" className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={exportToCSV} title="Export CSV" className="p-2 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all">
                                                        <FileText className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* University cards */}
                                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                            {activeResults.recommended_universities?.map((uni) => {
                                                const savedItem = saved.find(s => isSameUniversity(s, uni));
                                                const isSaved = !!savedItem;
                                                const isBookmarkPending =
                                                    (isSaving && savingUniversity && isSameUniversity(savingUniversity, uni)) ||
                                                    (isUnsaving && unsavingSavedId === savedItem?.id);
                                                const cardKey = uni.id || uni.university_id || `${uni.university_name}-${uni.country}`;
                                                return (
                                                    <UniversityResultCard
                                                        key={cardKey}
                                                        university={uni}
                                                        onSave={() => saveUniversity({ ...uni, session_id: activeResults.session_id || null })}
                                                        onUnsave={() => { if (savedItem) unsaveUniversity(savedItem.id); }}
                                                        isSaved={isSaved}
                                                        isBookmarkPending={isBookmarkPending}
                                                        showCompare={true}
                                                        onCompareToggle={() => toggleCompare(uni)}
                                                        isComparing={comparingItems.some(s => isSameUniversity(s, uni))}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Modals ── */}
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

            {/* ── Delete Confirm Dialog ── */}
            {sessionToDelete && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        tabIndex={-1}
                        className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl max-w-sm w-full mx-4 focus:outline-none border border-gray-100 dark:border-gray-700"
                    >
                        <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4 mx-auto">
                            <Trash2 className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">Delete History</h3>
                        <p className="text-sm text-gray-500 mb-6 text-center">
                            Permanently remove this recommendation session? This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setSessionToDelete(null)} disabled={!!deletingSessionId || isDeletingHistory}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleDeleteConfirm} disabled={!!deletingSessionId || isDeletingHistory} className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 border-red-500 text-white">
                                {deletingSessionId || isDeletingHistory
                                    ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                                    : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchHistory;
