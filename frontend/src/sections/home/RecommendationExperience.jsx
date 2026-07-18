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
            },
            onComplete: () => {
              gsap.to('.float-anim', {
                y: -5,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                stagger: 0.2
              });
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
    <section id="experience" ref={containerRef} className="py-24 lg:py-32 scroll-mt-20 relative border-t border-border-subtle bg-[url('/images/experience-bg.png')] bg-cover bg-center bg-fixed">
      {/* Subtle Overlay so image isn't darkened */}
      <div className="absolute inset-0 bg-black/20 z-0"></div>

      <Container className="relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          <div className="w-full lg:w-1/2">

            <SectionHeading
              title="Your Personalized StudyRoute Experience"
              description="StudyRoute's advanced AI engine analyzes your unique academic profile, budget, and career aspirations to instantly match you with the best-fit global universities. We eliminate the guesswork, providing data-driven insights to maximize your admission success."
              alignment="left"
              className="mb-8 [&>h2]:font-bold [&>h2]:text-white [&>p]:text-white/90"
            />

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-landing-accent mr-3 mt-1" aria-hidden="true">✦</span>
                <p className="text-white/90"><strong className="text-white font-bold">Smart Profiling:</strong> We assess your grades, test scores, and preferences to build a comprehensive applicant profile.</p>
              </li>
              <li className="flex items-start">
                <span className="text-landing-accent mr-3 mt-1" aria-hidden="true">✦</span>
                <p className="text-white/90"><strong className="text-white font-bold">Precision Matching:</strong> Our algorithm filters thousands of institutions to find your ideal "Target", "Safe", and "Reach" universities.</p>
              </li>
              <li className="flex items-start">
                <span className="text-landing-accent mr-3 mt-1" aria-hidden="true">✦</span>
                <p className="text-white/90"><strong className="text-white font-bold">Actionable Insights:</strong> Get transparent admission probabilities and detailed prerequisite breakdowns for confident decision-making.</p>
              </li>
            </ul>
          </div>

          {/* Conceptual UI Side */}
          <div className="w-full lg:w-1/2 relative min-h-[400px] flex items-center justify-center">
            {/* Background Blur */}
            <div className="absolute inset-0 bg-landing-accent/5 rounded-full blur-[100px] -z-10" aria-hidden="true" />

            <div className="w-full max-w-md space-y-4 relative z-10">



              {/* Profile Chips */}
              <div className="rec-card float-anim flex flex-wrap gap-2 mb-6 p-4 bg-bg-surface/80 glass rounded-xl border border-border-subtle">
                <div className="w-full mb-2 flex justify-between items-center">
                  <span className="text-xs font-medium text-text-secondary">Student Profile Evaluated</span>
                  <span className="text-[10px] px-2 py-0.5 bg-landing-accent/10 text-landing-accent rounded-full border border-landing-accent/20">Verified</span>
                </div>
                <span className="px-3 py-1 bg-bg-base rounded border border-border-subtle text-xs">BSc Computer Science</span>
                <span className="px-3 py-1 bg-bg-base rounded border border-border-subtle text-xs">CGPA: 3.6</span>
                <span className="px-3 py-1 bg-bg-base rounded border border-border-subtle text-xs">IELTS: 7.5</span>
                <span className="px-3 py-1 bg-bg-base rounded border border-border-subtle text-xs">Budget: $25k/yr</span>
              </div>

              {/* Card 1 - Target */}
              <div className="rec-card float-anim p-5 bg-bg-surface border border-border-focus shadow-[0_0_15px_rgba(var(--color-landing-accent),0.05)] rounded-xl flex items-center justify-between group transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-landing-accent" />
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-bg-base border border-border-subtle flex items-center justify-center overflow-hidden">
                    <img src="/flags/gb.svg" alt="UK" className="w-6 h-auto rounded-sm object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-primary mb-1">University of Edinburgh</h4>
                    <span className="text-xs text-text-secondary flex items-center gap-2">
                      <span className="text-landing-accent font-medium">92% Match</span>
                      <span className="w-1 h-1 rounded-full bg-border-subtle" />
                      <span>Target</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[10px] text-text-secondary uppercase tracking-wide">Admission Prob.</span>
                  <div className="w-16 h-1.5 bg-bg-base rounded-full overflow-hidden">
                    <div className="h-full bg-landing-accent w-[92%]" />
                  </div>
                </div>
              </div>

              {/* Card 2 - Safe */}
              <div className="rec-card float-anim p-5 bg-bg-surface border border-border-subtle rounded-xl flex items-center justify-between group hover:border-border-focus transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-bg-base border border-border-subtle flex items-center justify-center overflow-hidden">
                    <img src="/flags/ca.svg" alt="Canada" className="w-6 h-auto rounded-sm object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-primary mb-1">University of Calgary</h4>
                    <span className="text-xs text-text-secondary flex items-center gap-2">
                      <span className="text-landing-accent font-medium opacity-80">98% Match</span>
                      <span className="w-1 h-1 rounded-full bg-border-subtle" />
                      <span>Safe</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[10px] text-text-secondary uppercase tracking-wide">Admission Prob.</span>
                  <div className="w-16 h-1.5 bg-bg-base rounded-full overflow-hidden">
                    <div className="h-full bg-landing-accent w-[98%] opacity-80" />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};
