import { forwardRef } from 'react';

export const SectionHeading = forwardRef(({
  title,
  description,
  alignment = 'center',
  className = ''
}, ref) => {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto'
  };

  return (
    <div ref={ref} className={`max-w-2xl mb-12 lg:mb-16 ${alignmentClasses[alignment]} ${className}`}>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-editorial mb-4 lg:mb-6 text-balance">
        {title}
      </h2>
      {description && (
        <p className="text-base sm:text-lg text-text-secondary text-balance leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
});

SectionHeading.displayName = 'SectionHeading';
