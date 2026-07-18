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
    <div ref={ref} className={`max-w-[760px] mb-12 lg:mb-16 ${alignmentClasses[alignment]} ${className}`}>
      <h2 className="text-[32px] sm:text-[36px] lg:text-[48px] font-editorial font-semibold leading-[1.1] lg:leading-[1.08] tracking-[-0.025em] mb-4 lg:mb-6 text-balance">
        {title}
      </h2>
      {description && (
        <p className="text-[16px] lg:text-[18px] text-text-secondary font-normal text-balance leading-[1.6]">
          {description}
        </p>
      )}
    </div>
  );
});

SectionHeading.displayName = 'SectionHeading';
