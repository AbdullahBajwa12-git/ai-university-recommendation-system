import { useRef } from 'react';
import { Container } from '../../components/layout/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { useRevealAnimation } from '../../animations/useGsapAnimation';

export const ResponsibleGuidance = () => {
  const sectionRef = useRef(null);

  useRevealAnimation(sectionRef);

  return (
    <section id="guidance" ref={sectionRef} className="py-24 lg:py-32 scroll-mt-20 bg-bg-surface border-t border-border-subtle relative overflow-hidden">
      <Container>
        <div className="max-w-4xl mx-auto bg-bg-base/50 glass rounded-2xl p-8 md:p-12 lg:p-16 border border-border-subtle relative">

          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none" aria-hidden="true">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          <SectionHeading
            title="Responsible Guidance"
            description="We believe your education decisions should be built on clarity and verified facts, not false promises."
            alignment="left"
            className="mb-10"
          />

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 text-text-secondary leading-relaxed">
            <div>
              <h4 className="text-text-primary font-medium text-lg mb-3 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-landing-accent mr-3" />
                Source-Backed Information
              </h4>
              <p className="text-sm md:text-base">
                University data is curated from official sources. We strive for accuracy, but official university websites should always be checked before making final application decisions.
              </p>
            </div>

            <div>
              <h4 className="text-text-primary font-medium text-lg mb-3 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-landing-accent mr-3" />
                No False Guarantees
              </h4>
              <p className="text-sm md:text-base">
                StudyRoute provides guidance to streamline your discovery process. We do not act as an admission authority and we do not guarantee university admission or visa approvals.
              </p>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};
