import { forwardRef } from 'react';

export const SectionLabel = forwardRef(({ text, className = '' }, ref) => {
  return (
    <div
      ref={ref}
      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-border-subtle bg-bg-surface text-landing-accent text-sm font-medium ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-landing-accent animate-pulse" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
});

SectionLabel.displayName = 'SectionLabel';
