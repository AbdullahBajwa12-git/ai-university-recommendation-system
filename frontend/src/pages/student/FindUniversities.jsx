import { useState } from 'react';
import {
    Sparkles, Search,
    Download, FileText,
    TrendingUp, RotateCcw, X
} from 'lucide-react';
import { useRecommendations } from '../../hooks/useRecommendations';
import { useSearchHistory } from '../../hooks/useSearchHistory';
import UniversityFinderModal from '../../components/modals/UniversityFinderModal';
import UniversityResultCard from '../../components/cards/UniversityResultCard';
import CompareModal from '../../components/modals/CompareModal';
import Button from '../../components/common/Button';
import profileService from '../../services/profileService';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
// Maps saved StudentProfile/Preferences fields → wizard form field names.
// Only returns keys that have a usable value, so it merges over defaults
// without clobbering anything with null/empty.
const STUDY_LEVEL_TO_DEGREE = {
    Bachelors: 'Bachelors',
    BS: 'Bachelors',
    Masters: 'Masters',
    MS: 'Masters',
    MPhil: 'MPhil',
    PhD: 'PhD'
};
const profileToWizard = (p) => {
    const out = {};
    if (p?.cgpa != null) out.cgpa = String(p.cgpa);
    if (p?.graduation_year != null) out.graduation_year = String(p.graduation_year);
    if (p?.ielts_score != null) out.ielts = String(p.ielts_score);
    if (p?.toefl_score != null) out.toefl = String(p.toefl_score);
    if (p?.gre_score != null) out.gre = String(p.gre_score);
    if (p?.gmat_score != null) out.gmat = String(p.gmat_score);
    if (p?.preferred_study_level && STUDY_LEVEL_TO_DEGREE[p.preferred_study_level]) {
        out.degree_applying_for = STUDY_LEVEL_TO_DEGREE[p.preferred_study_level];
    }
    if (Array.isArray(p?.preferred_countries) && p.preferred_countries.length) {
        out.countries = p.preferred_countries;
    }

    if (Array.isArray(p?.preferred_fields) && p.preferred_fields.length > 0) {
        const field = p.preferred_fields[0];
        out.intended_major = typeof field === 'string' ? field : (field?.name || String(field));
    } else if (typeof p?.preferred_fields === 'string' && p.preferred_fields.trim()) {
        out.intended_major = p.preferred_fields;
    }

    return out;
};

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

const FindUniversities = () => {
    const {
        saved,
        getRecommendations,
        isGenerating,
        saveUniversity,
        unsaveUniversity,
        isSaving,
        savingUniversity,
        isUnsaving,
        unsavingSavedId,
        isLoadingSaved,
        isSavedError,
        refetchSaved
    } = useRecommendations();

    const { saveToHistory } = useSearchHistory();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeResults, setActiveResults] = useState(null);
    const [comparingItems, setComparingItems] = useState([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('new'); // 'new', 'history', 'saved'
    const [prefillData, setPrefillData] = useState(null);  // form data from history/profile
    const [prefillSource, setPrefillSource] = useState(null); // 'profile' | 'history' | null

    // Open a fresh wizard, pre-filling from the saved profile/preferences when available.
    // Profile fetch is best-effort: failure or empty data just opens the default form.
    const openFreshWizard = async () => {
        setPrefillData(null);
        setPrefillSource(null);
        setIsModalOpen(true);
        try {
            const profile = await profileService.getProfile();
            const mapped = profileToWizard(profile || {});
            if (Object.keys(mapped).length > 0) {
                setPrefillData(mapped);
                setPrefillSource('profile');
            }
        } catch {
            // Ignore — the wizard works fine with default/empty values.
        }
    };

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
                setPrefillSource(null);
            }
        } catch (error) {
            console.error("Failed to get recommendations:", error);
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
        if ((viewMode === 'new' || viewMode === 'history') && activeResults) return activeResults.recommended_universities || [];
        if (viewMode === 'saved') return saved || [];
        return [];
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
                        onClick={openFreshWizard}
                        className="gap-2 px-8 rounded-2xl shadow-xl shadow-primary/20 bg-gradient-to-br from-primary to-indigo-600"
                    >
                        <Sparkles className="h-5 w-5" /> Find Universities
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-8">



                {/* Main Content Area */}
                <div className="xl:col-span-3 space-y-8">

                    {activeResults ? (
                        <>
                            {/* Controls */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-end items-center gap-4">

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
                            {viewMode === 'saved' && isLoadingSaved ? (
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
                            ) : viewMode === 'saved' && isSavedError ? (
                                <div className="md:col-span-2 py-20 text-center bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700">
                                    <div className="h-16 w-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <X className="h-8 w-8 text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Failed to load saved universities</h3>
                                    <p className="text-gray-500 mb-6">There was a problem loading your bookmarks. Please try again.</p>
                                    <Button onClick={() => refetchSaved()} className="mx-auto bg-gray-900 text-white dark:bg-gray-700">
                                        <RotateCcw className="h-4 w-4 mr-2 inline" /> Retry
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {displayUniversities().length > 0 ? (
                                        displayUniversities().map((uni) => {
                                            const savedItem =
                                                viewMode === 'saved' && uni.id
                                                    ? uni
                                                    : saved.find((s) => isSameUniversity(s, uni));
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
                                                        university_id: uni.university_id || null,
                                                        university_name: uni.university_name,
                                                        country: uni.country,
                                                        city: uni.city || null,
                                                        degree: uni.degree,
                                                        major: uni.major,
                                                        admission_chance: uni.admission_chance,
                                                        category: uni.category || null,
                                                        world_rank: uni.world_rank || null,
                                                        scholarship_available: uni.scholarship_available || null,
                                                        university_email: uni.university_email || null,
                                                        university_website: uni.university_website || null,
                                                        course_page_url: uni.course_page_url || null,
                                                        tuition_fee: uni.tuition_fee || null,
                                                        acceptance_rate: uni.acceptance_rate || null,
                                                        deadline: uni.deadline || null,
                                                        reason_for_match: uni.reason_for_match || null,
                                                        session_id: activeResults?.session_id || null
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
                                        })
                                    ) : (
                                        <div className="md:col-span-2 py-20 text-center">
                                            <div className="h-20 w-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Search className="h-10 w-10 text-gray-300" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">
                                                {viewMode === 'saved' ? 'No saved universities yet' : 'No universities found here'}
                                            </h3>
                                            <p className="text-gray-500 mb-8">
                                                {viewMode === 'saved'
                                                    ? 'Your bookmarked universities will appear here. Start searching to find and save your favorites.'
                                                    : 'Try searching for new recommendations or save your favorites.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                            <div className="bg-gradient-to-b from-[#6366f1] to-[#4f46e5] rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-500/20 flex flex-col justify-between min-h-[400px]">
                                <div>
                                    <TrendingUp className="h-8 w-8 mb-6 text-white" />
                                    <h3 className="text-2xl font-bold mb-4">Enhance admission chances by matching accurately</h3>
                                    <p className="text-white/80 text-sm leading-relaxed">Our AI considers GPA, language test scores, and research papers for real-world accuracy.</p>
                                </div>
                                <button className="mt-8 w-full text-xs font-bold tracking-widest uppercase bg-white/10 hover:bg-white/20 transition-colors py-4 rounded-xl border border-white/20">
                                    Learn how it works
                                </button>
                            </div>

                            <div className="xl:col-span-3 py-32 text-center bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700">
                                <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                                </div>
                                <h2 className="text-3xl font-black mb-4">You haven't run a search yet</h2>
                                <p className="text-gray-500 mb-10 max-w-md mx-auto">Complete our 6-step wizard to see AI-powered university matches tailored exactly to your profile.</p>
                                <Button
                                    onClick={openFreshWizard}
                                    className="rounded-2xl px-12 h-14 text-lg bg-gradient-to-br from-primary to-indigo-600 shadow-2xl shadow-primary/30"
                                >
                                    Start Free Evaluation
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
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


        </div>
    );
};

export default FindUniversities;
