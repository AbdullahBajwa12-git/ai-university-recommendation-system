import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../animations/gsapSetup';
import { Container } from '../../components/layout/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { journeyStages } from '../../data/homepageData';

export const StudentJourney = () => {
  const containerRef = useRef(null);
  const headingRef = useRef(null);
  const wrapperRef = useRef(null);
  const lineRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      isMobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
      isReduced: "(prefers-reduced-motion: reduce)"
    }, (context) => {
      let { isDesktop, isMobile, isReduced } = context.conditions;

      if (isReduced) {
        gsap.set('.journey-stage', { opacity: 1, y: 0, clearProps: 'transform' });
        gsap.set(headingRef.current, { opacity: 1, y: 0, clearProps: 'transform' });
        if (lineRef.current) gsap.set(lineRef.current, { scaleX: 1, clearProps: 'transform' });
        return;
      }
      
      gsap.set('.journey-stage', { opacity: 0, y: isMobile ? 18 : 24 });
      gsap.set(headingRef.current, { opacity: 0, y: 20 });

      // 1. Heading Reveal
      gsap.fromTo(headingRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            invalidateOnRefresh: true,
            toggleActions: "play none none reverse"
          }
        }
      );

      // 2. Journey Stages (Individual triggers)
      const stages = gsap.utils.toArray('.journey-stage');
      stages.forEach((stage) => {
        gsap.fromTo(stage,
          { opacity: 0, y: isMobile ? 18 : 24 },
          {
            opacity: 1,
            y: 0,
            duration: isMobile ? 0.6 : 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: stage,
              start: isMobile ? 'top 86%' : 'top 78%',
              invalidateOnRefresh: true,
              toggleActions: "play none none reverse"
            }
          }
        );
      });

      // 3. Journey Progress Line (Desktop only)
      if (isDesktop && lineRef.current) {
        gsap.fromTo(lineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: 'top 72%',
              end: 'bottom 65%',
              scrub: 1.5,
              invalidateOnRefresh: true
            }
          }
        );
      }
    });
    
    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <section id="journey" ref={containerRef} className="py-24 lg:py-32 scroll-mt-20 bg-bg-base border-t border-border-subtle">
      <Container>
        <div ref={headingRef}>
          <SectionHeading
            title="The Student Journey"
            description="A clear, logical pathway from initial discovery to making informed decisions about your future."
          />
        </div>

        <div ref={wrapperRef} className="relative mt-16 max-w-5xl mx-auto">
          {/* Journey Line Base (Desktop only) */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-border-subtle" aria-hidden="true">
            {/* Animated Progress Line */}
            <div
              ref={lineRef}
              className="absolute top-0 left-0 h-full bg-landing-accent origin-left"
              style={{ scaleX: 0 }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative">
            {journeyStages.map((stage, index) => (
              <div key={index} className="journey-stage flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-bg-surface border border-border-focus flex items-center justify-center text-landing-accent font-medium mb-6 relative z-10">
                  {index + 1}
                </div>
                <h3 className="text-xl font-editorial mb-3 text-text-primary">{stage.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {stage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
