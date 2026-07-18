import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../animations/gsapSetup';
import { Container } from '../../components/layout/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { howItWorksSteps } from '../../data/homepageData';

export const Preview = () => {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isReduced: "(prefers-reduced-motion: reduce)",
      isNormal: "(prefers-reduced-motion: no-preference)"
    }, (context) => {
      let { isReduced } = context.conditions;

      if (!isReduced) {
        // Line drawing animation
        gsap.fromTo('.connecting-line',
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            duration: 1.5,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%'
            }
          }
        );

        // Step cards stagger animation
        gsap.fromTo('.step-card',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
            }
          }
        );

        // Continuous animations for decorative elements
        gsap.to('.anim-pulse', {
          scale: 1.15,
          opacity: 0.5,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });

        gsap.to('.anim-float', {
          y: -10,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: 0.2
        });

        gsap.fromTo('.anim-progress',
          { width: '0%' },
          {
            width: '100%',
            duration: 2.5,
            repeat: -1,
            ease: 'power2.inOut',
            stagger: 0.2
          }
        );

        gsap.to('.anim-spin-slow', {
          rotate: 360,
          duration: 8,
          repeat: -1,
          ease: 'linear'
        });

        gsap.to('.anim-scan', {
          y: 20,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });

      } else {
        gsap.set(['.connecting-line', '.step-card'], { opacity: 1, y: 0, scaleX: 1, clearProps: 'transform' });
      }
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 lg:py-32 scroll-mt-20 bg-bg-base relative border-t border-border-subtle overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-landing-accent/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <Container className="relative z-10">
        <div className="flex flex-col items-center text-center mb-8">

          <SectionHeading
            title="How StudyRoute AI Works"
            description="A seamless, intelligent journey from profile creation to securing your dream university."
          />
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting line for larger screens */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-border-subtle overflow-hidden rounded-full" aria-hidden="true">
            <div className="connecting-line w-full h-full bg-gradient-to-r from-landing-accent/20 via-landing-accent to-landing-accent/20" />
          </div>

          {howItWorksSteps.map((step, index) => (
            <div key={index} className="step-card relative flex flex-col items-center text-center group p-8 lg:p-10 transition-all duration-500 hover:shadow-[0_15px_40px_-5px_rgba(var(--color-landing-accent),0.3)] hover:-translate-y-2 hover:scale-[1.02] z-10 rounded-2xl">

              {/* Colorful gradient border (permanent) */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-landing-accent to-dest-1 pointer-events-none -z-20" style={{ padding: '2px' }}>
                 <div className="w-full h-full bg-bg-surface rounded-2xl" />
              </div>

              {/* Number Badge (Animated) */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-bg-base to-bg-surface border border-border-subtle flex items-center justify-center text-text-primary font-editorial text-3xl mb-8 shadow-sm relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-landing-accent group-hover:to-dest-1 group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_10px_25px_-5px_rgba(var(--color-landing-accent),0.5)]">
                <span className="relative z-10 font-bold">{step.number}</span>
              </div>

              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-landing-accent to-dest-1 bg-clip-text text-transparent relative z-10">{step.title}</h3>
              <p className="text-text-secondary leading-relaxed mb-10 relative z-10">
                {step.description}
              </p>

              {/* Decorative AI visual element */}
              <div className="mt-auto h-20 flex items-center justify-center w-full border-t border-border-subtle/50 pt-8" aria-hidden="true">
                {step.icon === 'profile' && (
                   <div className="relative w-16 h-16 flex items-center justify-center overflow-hidden rounded-full">
                     <div className="absolute inset-0 rounded-full border border-landing-accent/20 bg-landing-accent/5" />
                     <div className="absolute inset-2 rounded-full border border-dashed border-dest-1/40 anim-spin-slow" />
                     <div className="absolute inset-4 rounded-full border border-landing-accent/40 anim-pulse" />
                     <div className="w-3 h-3 rounded-full bg-landing-accent shadow-[0_0_15px_rgba(var(--color-landing-accent),0.8)] relative z-10" />
                     {/* scanning line */}
                     <div className="anim-scan absolute top-2 w-12 h-[2px] bg-gradient-to-r from-transparent via-dest-1 to-transparent rounded-full shadow-[0_0_10px_rgba(var(--color-dest-1),0.6)]" />
                   </div>
                )}
                {step.icon === 'explore' && (
                   <div className="flex items-end justify-center space-x-3 h-14 w-full">
                     <div className="relative group/bar flex justify-center cursor-default">
                       <div className="absolute -top-6 opacity-0 group-hover/bar:opacity-100 transition-opacity text-[10px] text-dest-1 font-bold bg-bg-surface px-1.5 py-0.5 rounded border border-border-subtle shadow-sm z-10">92%</div>
                       <div className="anim-float w-4 h-6 rounded-t-sm bg-dest-1 shadow-[0_0_8px_rgba(var(--color-dest-1),0.4)] transition-all duration-300 group-hover/bar:h-10 group-hover/bar:brightness-110" style={{ animationDelay: '0s' }} />
                     </div>
                     <div className="relative group/bar flex justify-center cursor-default">
                       <div className="absolute -top-6 opacity-0 group-hover/bar:opacity-100 transition-opacity text-[10px] text-dest-2 font-bold bg-bg-surface px-1.5 py-0.5 rounded border border-border-subtle shadow-sm z-10">98%</div>
                       <div className="anim-float w-4 h-10 rounded-t-sm bg-dest-2 shadow-[0_0_8px_rgba(var(--color-dest-2),0.4)] transition-all duration-300 group-hover/bar:h-12 group-hover/bar:brightness-110" style={{ animationDelay: '0.2s' }} />
                     </div>
                     <div className="relative group/bar flex justify-center cursor-default">
                       <div className="absolute -top-6 opacity-0 group-hover/bar:opacity-100 transition-opacity text-[10px] text-landing-accent font-bold bg-bg-surface px-1.5 py-0.5 rounded border border-border-subtle shadow-sm z-10">85%</div>
                       <div className="anim-float w-4 h-8 rounded-t-sm bg-landing-accent shadow-[0_0_8px_rgba(var(--color-landing-accent),0.4)] transition-all duration-300 group-hover/bar:h-10 group-hover/bar:brightness-110" style={{ animationDelay: '0.4s' }} />
                     </div>
                   </div>
                )}
                {step.icon === 'guidance' && (
                   <div className="flex flex-col justify-center space-y-3 w-full max-w-[140px]">
                     <div className="relative h-2 w-full bg-bg-base/80 overflow-visible rounded-full border border-border-subtle">
                       <div className="anim-progress relative h-full bg-landing-accent w-0 rounded-full shadow-[0_0_5px_rgba(var(--color-landing-accent),0.4)]">
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(var(--color-landing-accent),1)] border border-landing-accent/20" />
                       </div>
                     </div>
                     <div className="relative h-2 w-full bg-bg-base/80 overflow-visible rounded-full border border-border-subtle">
                       <div className="anim-progress relative h-full bg-dest-1 w-0 rounded-full shadow-[0_0_5px_rgba(var(--color-dest-1),0.4)]" style={{ animationDelay: '0.2s' }}>
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(var(--color-dest-1),1)] border border-dest-1/20" />
                       </div>
                     </div>
                     <div className="relative h-2 w-[85%] bg-bg-base/80 overflow-visible rounded-full border border-border-subtle">
                       <div className="anim-progress relative h-full bg-dest-2 w-0 rounded-full shadow-[0_0_5px_rgba(var(--color-dest-2),0.4)]" style={{ animationDelay: '0.4s' }}>
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(var(--color-dest-2),1)] border border-dest-2/20" />
                       </div>
                     </div>
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
