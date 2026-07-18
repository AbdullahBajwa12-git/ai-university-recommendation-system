import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../animations/gsapSetup';
import { Container } from '../../components/layout/Container';

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
    <section id="experience" ref={containerRef} className="py-24 lg:py-32 scroll-mt-20 relative border-t border-border-subtle bg-[url('/images/Image_1.jpg')] bg-cover bg-center bg-fixed overflow-hidden">
      {/* Strong dark overlay for readability */}
      <div className="absolute inset-0 z-0" style={{ backgroundColor: 'rgba(5, 10, 18, 0.68)' }}></div>

      <Container className="relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left Column (45%) */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center">

            <div className="mb-10 max-w-[620px]">
              <h2 className="text-[34px] sm:text-[38px] lg:text-[52px] font-editorial font-semibold text-white leading-[1.1] lg:leading-[1.02] mb-6 text-balance tracking-[-0.02em]">
                University Recommendations<br className="hidden lg:block" /> Built Around You
              </h2>
              <p className="text-[16px] lg:text-[18px] text-white/90 font-normal leading-[1.65]">
                StudyRoute evaluates your academic profile and preferences to create a focused university shortlist. Each recommendation includes clear match factors, relevant program information, and details that help you compare your options confidently.
              </p>
            </div>

            <ul className="flex flex-col gap-[22px] max-w-[580px]">
              <li className="flex items-start">
                <span className="text-landing-accent mr-3.5 mt-1" aria-hidden="true">✦</span>
                <p className="text-white/90 text-[16px] lg:text-[17px] leading-[1.65] font-normal">
                  <strong className="text-white font-bold">Profile-Based Matching:</strong> We consider your academic history, study interests, preferred destinations, and budget.
                </p>
              </li>
              <li className="flex items-start">
                <span className="text-landing-accent mr-3.5 mt-1" aria-hidden="true">✦</span>
                <p className="text-white/90 text-[16px] lg:text-[17px] leading-[1.65] font-normal">
                  <strong className="text-white font-bold">Focused University Shortlists:</strong> Suitable universities are filtered using your selected requirements and available data.
                </p>
              </li>
              <li className="flex items-start">
                <span className="text-landing-accent mr-3.5 mt-1" aria-hidden="true">✦</span>
                <p className="text-white/90 text-[16px] lg:text-[17px] leading-[1.65] font-normal">
                  <strong className="text-white font-bold">Clear Comparison Details:</strong> Review match factors, entry requirements, programs, and other important information.
                </p>
              </li>
            </ul>
          </div>

          {/* Right Column (55%) */}
          <div className="w-full lg:w-[55%] relative flex flex-col items-center lg:items-end justify-center min-h-[400px]">
            {/* Background Blur */}
            <div className="absolute inset-0 bg-landing-accent/10 rounded-full blur-[100px] -z-10" aria-hidden="true" />

            <div className="w-full flex flex-col gap-5 relative z-10 max-w-[460px]">

              {/* Profile Chips */}
              <div className="rec-card float-anim flex flex-col gap-3 p-[24px] lg:p-[28px] bg-white rounded-2xl border border-border-subtle w-full shadow-[0_8px_30px_rgba(var(--color-landing-accent),0.15)]">
                <div className="w-full flex justify-between items-center mb-1">
                  <span className="text-[13px] font-bold text-black uppercase tracking-wide">Student Profile</span>
                  <span className="text-[10px] px-2 py-0.5 bg-landing-accent/10 text-landing-accent font-bold rounded-full border border-landing-accent/20">Verified</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1.5 bg-bg-base rounded-md border border-border-subtle text-[13px] text-text-primary font-medium shadow-sm">BSc Computer Science</span>
                  <span className="px-2.5 py-1.5 bg-bg-base rounded-md border border-border-subtle text-[13px] text-text-primary font-medium shadow-sm">CGPA: 3.6</span>
                  <span className="px-2.5 py-1.5 bg-bg-base rounded-md border border-border-subtle text-[13px] text-text-primary font-medium shadow-sm">IELTS: 7.5</span>
                  <span className="px-2.5 py-1.5 bg-bg-base rounded-md border border-border-subtle text-[13px] text-text-primary font-medium shadow-sm">Budget: $25k/yr</span>
                </div>
              </div>

              {/* Card 1 - Target */}
              <div className="rec-card float-anim p-[24px] lg:p-[28px] bg-white border border-border-focus shadow-[0_8px_30px_rgba(var(--color-landing-accent),0.15)] rounded-2xl flex items-center justify-between group transition-all relative overflow-hidden w-full">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-landing-accent" />
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-bg-base border border-border-subtle flex items-center justify-center overflow-hidden shrink-0">
                    <img src="/flags/gb.svg" alt="UK" className="w-6 h-auto rounded-sm object-cover" />
                  </div>
                  <div>
                    <h4 className="text-[18px] lg:text-[20px] font-bold text-text-primary mb-0.5">University of Edinburgh</h4>
                    <span className="text-[12px] lg:text-[13px] text-text-secondary flex items-center gap-1.5 font-medium">
                      <span className="text-landing-accent">92% Match</span>
                      <span className="w-1 h-1 rounded-full bg-border-subtle" />
                      <span>Target</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0 hidden sm:flex">
                  <span className="text-[9px] text-text-secondary uppercase tracking-wider font-bold">Match</span>
                  <div className="w-12 h-1.5 bg-bg-base rounded-full overflow-hidden">
                    <div className="h-full bg-landing-accent w-[92%]" />
                  </div>
                </div>
              </div>

              {/* Card 2 - Safe */}
              <div className="rec-card float-anim p-[24px] lg:p-[28px] bg-white border border-border-subtle shadow-sm rounded-2xl flex items-center justify-between group hover:border-border-focus transition-all w-full">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-bg-base border border-border-subtle flex items-center justify-center overflow-hidden shrink-0">
                    <img src="/flags/ca.svg" alt="Canada" className="w-6 h-auto rounded-sm object-cover" />
                  </div>
                  <div>
                    <h4 className="text-[18px] lg:text-[20px] font-bold text-text-primary mb-0.5">University of Calgary</h4>
                    <span className="text-[12px] lg:text-[13px] text-text-secondary flex items-center gap-1.5 font-medium">
                      <span className="text-landing-accent opacity-80">98% Match</span>
                      <span className="w-1 h-1 rounded-full bg-border-subtle" />
                      <span>Safe</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0 hidden sm:flex">
                  <span className="text-[9px] text-text-secondary uppercase tracking-wider font-bold">Match</span>
                  <div className="w-12 h-1.5 bg-bg-base rounded-full overflow-hidden">
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
