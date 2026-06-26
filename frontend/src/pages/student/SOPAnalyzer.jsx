import React, { useState } from 'react';
import {
  FileText, CheckCircle2, AlertTriangle, Search, Sparkles, ArrowRight, Clock,
} from 'lucide-react';
import Button from '../../components/common/Button';
import FutureScopeBanner from '../../components/common/FutureScopeBanner';
import { cn } from '../../utils/cn';

const SOPAnalyzer = () => {
  const [sopText, setSopText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = () => {
    if (!sopText.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setResult({
        clarity: 88,
        structure: 72,
        persuasion: 65,
        suggestions: [
          'The opening paragraph is strong, but the transition to research goals is abrupt.',
          'Use more active verbs in the professional experience section.',
          'Expand the "Why this university?" section with specific faculty names.',
        ],
      });
      setAnalyzing(false);
    }, 2500);
  };

  const scores = result
    ? [
        { label: 'Clarity', val: result.clarity, color: 'bg-emerald-500' },
        { label: 'Structure', val: result.structure, color: 'bg-amber-500' },
        { label: 'Persuasion', val: result.persuasion, color: 'bg-blue-500' },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <FutureScopeBanner message="The SOP Analyzer is a planned feature. The clarity, structure and persuasion scores shown are sample values for demonstration — your text is not yet analysed by a live model." />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Statement of Purpose Analyzer
          </h2>
          <p className="text-gray-500 mt-1">Get AI feedback on your SOP's structure, clarity, and impact.</p>
        </div>
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-bold">
          <Sparkles className="h-3 w-3" /> GPT-4o Intelligence
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Editor */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-[580px]">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <FileText className="h-3 w-3" /> SOP Editor
              </span>
              <span className="text-[10px] text-gray-400 font-mono">{sopText.length} chars</span>
            </div>

            {analyzing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 rounded-3xl gap-4">
                <div className="h-16 w-16 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-blue-500 animate-pulse" />
                </div>
                <p className="font-bold text-gray-700 dark:text-gray-200">AI is analyzing your SOP...</p>
              </div>
            )}

            <textarea
              className="flex-1 p-7 bg-transparent border-none focus:ring-0 outline-none text-base leading-relaxed resize-none text-gray-800 dark:text-gray-200 placeholder:text-gray-300"
              placeholder="Paste your Statement of Purpose here..."
              value={sopText}
              onChange={(e) => setSopText(e.target.value)}
            />
            <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => { setSopText(''); setResult(null); }}>Clear</Button>
              <Button size="md" className="px-10 rounded-xl" onClick={handleAnalyze} isLoading={analyzing}>
                Analyze SOP
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {!result && !analyzing && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl bg-gray-50/50 dark:bg-gray-900/20 text-center">
              <Search className="h-10 w-10 text-gray-200 dark:text-gray-600 mb-3" />
              <h4 className="font-bold text-gray-400">Awaiting Analysis</h4>
              <p className="text-sm text-gray-400 mt-1">Submit your SOP text to receive AI feedback.</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Score bars */}
              <div className="bg-white dark:bg-gray-800 p-7 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-5">
                <h5 className="font-bold text-xs uppercase tracking-widest text-gray-400">Analytics</h5>
                {scores.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                      <span>{item.label}</span>
                      <span>{item.val}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-1000', item.color)}
                        style={{ width: `${item.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              <div className="bg-white dark:bg-gray-800 p-7 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                <h5 className="font-bold text-xs uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-amber-500" /> Improvements
                </h5>
                {result.suggestions.map((sg, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{sg}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full text-xs gap-2 rounded-xl">
                  <Clock className="h-3 w-3" /> Request Full Review (24h)
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SOPAnalyzer;
