import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Demo-safety banner for pages that are not yet backed by the live system.
 * Clarifies that any data/results shown are sample content, not real output.
 */
const FutureScopeBanner = ({ message }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-5 py-4">
    <Sparkles className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
    <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
      {message ||
        'Preview feature — this module is planned as a future enhancement. The content shown here is sample data for demonstration and is not produced by the live system yet.'}
    </p>
  </div>
);

export default FutureScopeBanner;
