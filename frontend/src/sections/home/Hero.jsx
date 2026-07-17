import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../animations/gsapSetup';
import { Container } from '../../components/layout/Container';
import { Button } from '../../components/ui/Button';
import { StudyRouteGlobe } from '../../components/visuals/StudyRouteGlobe';

export const Hero = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      isMobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
      isReduced: "(prefers-reduced-motion: reduce)"
    }, (context) => {
      let { isMobile, isReduced } = context.conditions;

      const tl = gsap.timeline({ delay: 0.2 });

      // Animate eyebrow
      tl.fromTo('.hero-eyebrow',
        { opacity: 0, y: isReduced ? 0 : 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );

      // Animate heading lines (staggered)
      tl.fromTo('.hero-heading-line',
        { opacity: 0, y: isReduced ? 0 : (isMobile ? 20 : 30), rotateX: isReduced ? 0 : -10 },
        { opacity: 1, y: 0, rotateX: 0, duration: 1, stagger: 0.15, ease: 'power3.out' },
        '-=0.4'
      );

      // Animate paragraph
      tl.fromTo('.hero-paragraph',
        { opacity: 0, y: isReduced ? 0 : 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        '-=0.6'
      );

      // Animate buttons
      tl.fromTo('.hero-cta',
        { opacity: 0, y: isReduced ? 0 : 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
        '-=0.4'
      );

      // Animate visual elements
      if (!isReduced) {
        // Safe JS initialization to hide elements before timeline runs
        gsap.set('.globe-wrapper', { opacity: 0 });
        gsap.set('.globe-surface', { opacity: 0, scale: 0.95 });
        gsap.set('.globe-map', { opacity: 0 });
        gsap.set('.map-pakistan', { opacity: 0 });
        gsap.set('.pakistan-pin', { opacity: 0, y: 10 });
        gsap.set('.hero-visual-el:not(.globe-surface):not(.route-path)', { opacity: 0 }); // Other visuals like rings
        gsap.set('.dest-label', { opacity: 0, scale: 0.95 });
        gsap.set('.globe-study-label', { opacity: 0 });
        gsap.set('.route-path', { opacity: 0 });

        const visualTl = gsap.timeline();

        // 1. visual wrapper fades in
        visualTl.to('.globe-wrapper', { opacity: 1, duration: 0.4 });

        // 2. globe surface fades/scales in
        visualTl.to('.globe-surface', { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }, '-=0.2');

        // rings and other visual elements
        visualTl.to('.hero-visual-el:not(.globe-surface):not(.route-path)', { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.6');

        // 3. geographic map appears
        visualTl.to('.globe-map', { opacity: 0.8, duration: 0.6, ease: 'power2.out' }, '-=0.4');

        // 4. Pakistan highlight appears
        visualTl.to('.map-pakistan', { opacity: 1, duration: 0.4 }, '-=0.2');

        // 5. Pakistan pin appears
        visualTl.to('.pakistan-pin', { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' }, '-=0.1');

        // 6. "Let’s Study Abroad!" label appears
        visualTl.to('.globe-study-label', { opacity: 1, duration: 0.4, ease: 'power1.out' }, '-=0.2');

        // 7. four flag destination labels appear with restrained stagger
        visualTl.to('.dest-label', { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, '-=0.2');

        // 8. route paths appear
        visualTl.to('.route-path', { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2');

        tl.add(visualTl, '-=0.6');

        // Continuous subtle floating animation for floating elements
        gsap.to('.hero-float', {
          y: isMobile ? '-6px' : '-10px',
          duration: 3,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          stagger: { amount: 1.5, from: 'random' }
        });
      } else {
        // Show all visuals immediately if reduced motion
        gsap.set([
          '.globe-wrapper', '.globe-surface', '.globe-map', '.map-pakistan',
          '.pakistan-pin', '.hero-visual-el', '.dest-label', '.globe-study-label'
        ], { opacity: 1, y: 0, scale: 1 });
        gsap.set('.route-path', { opacity: 1 });
      }
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative min-h-[100svh] flex flex-col justify-center pt-28 pb-12 lg:pt-28 lg:pb-16 overflow-hidden">
      {/* Abstract Background Gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-landing-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none" aria-hidden="true" />

      <Container className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center z-10">

        {/* Content Side */}
        <div className="flex flex-col items-start w-full max-w-2xl mx-auto lg:mx-0">
          <div className="hero-eyebrow inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-border-subtle bg-bg-surface text-landing-accent text-sm font-medium mb-5 lg:mb-6">
            <span className="w-2 h-2 rounded-full bg-landing-accent animate-pulse" aria-hidden="true" />
            <span>AI-assisted university discovery</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-editorial font-medium leading-[1.05] tracking-tight mb-5 text-balance perspective-[1000px]">
            <div className="hero-heading-line origin-bottom">Find the right</div>
            <div className="hero-heading-line origin-bottom">university path</div>
            <div className="hero-heading-line origin-bottom text-text-secondary">for your future.</div>
          </h1>

          <p className="hero-paragraph text-base sm:text-lg md:text-xl text-text-secondary mb-8 max-w-xl text-balance leading-relaxed">
            Explore curated study destinations and receive guidance based on your academic profile, goals and preferences.
          </p>

          <div className="flex flex-wrap gap-4 mb-4 lg:mb-0">
            <Button variant="primary" size="lg" className="hero-cta" onClick={() => window.location.href = '/register'}>
              Start Exploring
            </Button>
            <Button variant="secondary" size="lg" className="hero-cta" onClick={() => { document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>
              See How It Works
            </Button>
          </div>

          {/* Mobile Visual (visible only on small screens) */}
          <div className="w-full relative flex lg:hidden items-center justify-center mt-8 h-[300px]">
            <StudyRouteGlobe isMobile={true} />
          </div>
        </div>

        {/* Visual Side: Desktop Geographic Concept */}
        <div className="relative h-[450px] md:h-[500px] lg:h-[550px] max-h-[65vh] w-full flex items-center justify-center lg:justify-end hidden lg:flex">
          <StudyRouteGlobe isMobile={false} />
        </div>

      </Container>
    </section>
  );
};
