import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../animations/gsapSetup';
import { Container } from '../../components/layout/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { SectionLabel } from '../../components/ui/SectionLabel';

export const RecommendationExperience = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isReduced: "(prefers-reduced-motion: reduce)",
      isNormal: "(prefers-reduced-motion: no-preference)"
    }, (context) => {
      let { isReduced } = context.conditions;

      if (!isReduced) {
        gsap.set('.rec-card', { opacity: 0, y: 30 });
        gsap.to('.rec-card', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 70%',
            }
          }
        );
      } else {
        gsap.set('.rec-card', { opacity: 1, y: 0, clearProps: 'transform' });
      }
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <section id="experience" ref={containerRef} className="py-24 lg:py-32 relative border-t border-border-subtle">
      <Container>
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Content Side */}
          <div className="w-full lg:w-1/2">
            <SectionLabel text="Intelligent Filtering" className="mb-6" />
            <SectionHeading
              title="Smart Recommendation Experience"
              description="Our AI-assisted platform analyzes your preferences to curate a tailored pool of university options based on verified data. We provide clear reasoning to support your decision-making, though final admission always depends on the institution."
              alignment="left"
              className="mb-8"
            />

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-landing-accent mr-3 mt-1" aria-hidden="true">✦</span>
                <p className="text-text-secondary"><strong className="text-text-primary font-medium">Curated Data:</strong> Information gathered from verified official sources.</p>
              </li>
              <li className="flex items-start">
                <span className="text-landing-accent mr-3 mt-1" aria-hidden="true">✦</span>
                <p className="text-text-secondary"><strong className="text-text-primary font-medium">Clear Comparisons:</strong> Evaluate institutions side-by-side on your priorities.</p>
              </li>
              <li className="flex items-start">
                <span className="text-landing-accent mr-3 mt-1" aria-hidden="true">✦</span>
                <p className="text-text-secondary"><strong className="text-text-primary font-medium">Honest Guidance:</strong> We estimate suitability without making false guarantees.</p>
              </li>
            </ul>
          </div>

          {/* Conceptual UI Side */}
          <div className="w-full lg:w-1/2 relative min-h-[400px] flex items-center justify-center">
            {/* Background Blur */}
            <div className="absolute inset-0 bg-landing-accent/5 rounded-full blur-[100px] -z-10" aria-hidden="true" />

            <div className="w-full max-w-md space-y-4 relative z-10">

              {/* Profile Chips */}
              <div className="rec-card flex flex-wrap gap-2 mb-6 p-4 bg-bg-surface/80 glass rounded-xl border border-border-subtle">
                <span className="text-xs font-medium text-text-secondary w-full mb-1">Your Preferences</span>
                <span className="px-3 py-1 bg-bg-base rounded border border-border-subtle text-xs">Computer Science</span>
                <span className="px-3 py-1 bg-bg-base rounded border border-border-subtle text-xs">United Kingdom</span>
                <span className="px-3 py-1 bg-bg-base rounded border border-border-subtle text-xs">Postgraduate</span>
              </div>

              {/* Card 1 - Target */}
              <div className="rec-card p-5 bg-bg-surface border border-border-subtle rounded-xl flex items-center justify-between group hover:border-border-focus transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-bg-base border border-border-subtle flex items-center justify-center">
                    <div className="w-6 h-6 rounded-sm bg-dest-1/30" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-primary mb-1">University of Edinburgh</h4>
                    <span className="text-xs text-text-secondary flex items-center gap-2">
                      <span>United Kingdom</span>
                      <span className="w-1 h-1 rounded-full bg-border-subtle" />
                      <span>Target</span>
                    </span>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full border border-border-subtle flex items-center justify-center group-hover:bg-landing-accent/10 transition-colors">
                  <span className="text-landing-accent text-xs">→</span>
                </div>
              </div>

              {/* Card 2 - Safe */}
              <div className="rec-card p-5 bg-bg-surface border border-border-subtle rounded-xl flex items-center justify-between group hover:border-border-focus transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-bg-base border border-border-subtle flex items-center justify-center">
                    <div className="w-6 h-6 rounded-sm bg-dest-2/30" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-primary mb-1">University of Calgary</h4>
                    <span className="text-xs text-text-secondary flex items-center gap-2">
                      <span>Canada</span>
                      <span className="w-1 h-1 rounded-full bg-border-subtle" />
                      <span>Safe</span>
                    </span>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full border border-border-subtle flex items-center justify-center group-hover:bg-landing-accent/10 transition-colors">
                  <span className="text-landing-accent text-xs">→</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};
