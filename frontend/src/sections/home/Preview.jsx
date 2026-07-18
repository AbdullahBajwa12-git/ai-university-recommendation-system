import { useRef } from 'react';
import { Container } from '../../components/layout/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { useRevealAnimation } from '../../animations/useGsapAnimation';
import { howItWorksSteps } from '../../data/homepageData';

export const Preview = () => {
  const sectionRef = useRef(null);

  // Use the existing reveal hook for scroll-triggered entrance
  useRevealAnimation(sectionRef);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 lg:py-32 scroll-mt-20 bg-bg-surface relative border-t border-border-subtle overflow-hidden">
      <Container>
        <SectionHeading
          title="How StudyRoute Helps"
          description="A simplified journey to discovering your ideal international study destination through curated guidance."
        />

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative mt-16">
          {/* Optional connecting line for larger screens */}
          <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-px bg-border-subtle" aria-hidden="true" />

          {howItWorksSteps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-bg-base border border-border-subtle flex items-center justify-center text-landing-accent font-editorial text-xl mb-6 shadow-lg relative z-10 transition-colors duration-300 group-hover:border-landing-accent/50 group-hover:bg-bg-surface-hover">
                {step.number}
              </div>
              <h3 className="text-xl font-medium mb-3 text-text-primary">{step.title}</h3>
              <p className="text-text-secondary leading-relaxed">
                {step.description}
              </p>

              {/* Decorative geometric shape instead of heavy external icon */}
              <div className="mt-8 opacity-50 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
                {step.icon === 'profile' && (
                   <div className="w-12 h-12 rounded-lg border-2 border-dashed border-border-focus flex items-center justify-center">
                     <div className="w-4 h-4 rounded-full bg-landing-accent/50" />
                   </div>
                )}
                {step.icon === 'explore' && (
                   <div className="flex space-x-2">
                     <div className="w-4 h-4 rounded-sm bg-dest-1/50" />
                     <div className="w-4 h-4 rounded-sm bg-dest-2/50" />
                     <div className="w-4 h-4 rounded-sm bg-landing-accent/50" />
                   </div>
                )}
                {step.icon === 'guidance' && (
                   <div className="flex flex-col space-y-2 w-12">
                     <div className="h-1.5 w-full bg-border-focus rounded-full" />
                     <div className="h-1.5 w-3/4 bg-border-subtle rounded-full" />
                     <div className="h-1.5 w-1/2 bg-border-subtle rounded-full" />
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
