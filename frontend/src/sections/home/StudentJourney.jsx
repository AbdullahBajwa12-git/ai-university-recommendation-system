import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../animations/gsapSetup';
import { Container } from '../../components/layout/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { journeyStages } from '../../data/homepageData';

export const StudentJourney = () => {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 1024px)",
      isReduced: "(prefers-reduced-motion: reduce)"
    }, (context) => {
      if (context.conditions.isReduced) {
        gsap.set('.journey-node', { opacity: 1, y: 0, clearProps: 'transform' });
        return;
      }

      // Node entrance animations
      gsap.fromTo('.journey-node',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: 'top 75%'
          }
        }
      );

      if (context.conditions.isDesktop) {
        // Continuous traveling light effect on the SVG zig zag path
        gsap.fromTo('.journey-light',
          { strokeDasharray: '40 600', strokeDashoffset: '640' },
          {
            strokeDashoffset: '0',
            duration: 3,
            repeat: -1,
            ease: 'linear'
          }
        );

        // Glow pulse on the step circles
        gsap.to('.journey-step-circle', {
          boxShadow: '0 0 25px rgba(var(--color-landing-accent), 0.6)',
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: 0.4
        });
      }
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <section id="journey" ref={containerRef} className="py-24 lg:py-32 scroll-mt-20 border-t border-border-subtle overflow-hidden relative bg-[url('/images/journey-bg.jpg')] bg-cover bg-center bg-fixed">

      {/* Elegant Overlay */}
      <div className="absolute inset-0 bg-bg-base/80 backdrop-blur-[2px] z-0"></div>

      <Container className="relative z-10">

        <div className="flex flex-col items-center text-center mb-16 lg:mb-24 relative z-10">

          <SectionHeading
            title="The Smart Student Journey"
            description="Experience a data-driven, zig-zag pathway from initial profiling to securing your future."
            className="mb-0 [&>h2]:text-blue-950 [&>p]:text-blue-900 font-medium"
          />
        </div>

        <div ref={wrapperRef} className="relative max-w-6xl mx-auto">

          {/* Zig-Zag SVG and Light Effect (Desktop Only) */}
          <div className="hidden lg:block absolute top-[28px] left-[12.5%] right-[12.5%] h-[120px] pointer-events-none z-0">
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 300 100" className="overflow-visible text-border-subtle">
              <defs>
                <filter id="glow-light" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="currentColor" />
                </marker>
              </defs>

              {/* Subtle Track with Arrows */}
              <path d="M 0,0 C 30,0 70,100 100,100" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" markerEnd="url(#arrowhead)" />
              <path d="M 100,100 C 130,100 170,0 200,0" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" markerEnd="url(#arrowhead)" />
              <path d="M 200,0 C 230,0 270,100 300,100" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" markerEnd="url(#arrowhead)" />

              {/* Traveling Light Pulse */}
              <path className="journey-light text-landing-accent" d="M 0,0 C 30,0 70,100 100,100 C 130,100 170,0 200,0 C 230,0 270,100 300,100" fill="none" stroke="currentColor" strokeWidth="3" vectorEffect="non-scaling-stroke" filter="url(#glow-light)" />
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0 relative z-10">
            {journeyStages.map((stage, index) => {
              const isEven = index % 2 !== 0; // 0=top, 1=bottom, 2=top, 3=bottom
              return (
                <div key={index} className={`journey-node flex flex-col items-center text-center px-4 ${isEven ? 'lg:mt-[120px]' : ''}`}>
                  <div className="journey-step-circle w-14 h-14 rounded-full bg-bg-surface border-2 border-landing-accent/50 flex items-center justify-center text-landing-accent font-bold text-xl mb-6 shadow-[0_0_15px_rgba(var(--color-landing-accent),0.2)] glass relative">
                    <span className="relative z-10">{index + 1}</span>
                    <div className="absolute inset-0 rounded-full bg-landing-accent/10 pointer-events-none" />
                  </div>
                  <div className="bg-bg-surface/60 glass p-5 rounded-2xl border border-border-subtle w-full h-full hover:border-landing-accent/50 transition-colors">
                    <h3 className="text-xl font-medium text-text-primary mb-3">{stage.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </Container>
    </section>
  );
};
