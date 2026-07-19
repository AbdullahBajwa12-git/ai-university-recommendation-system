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
    <section id="home" ref={containerRef} className="relative min-h-[100svh] flex flex-col justify-center pt-28 pb-12 lg:pt-28 lg:pb-16 overflow-hidden bg-[url('/images/Image_2.jpg')] bg-cover bg-center bg-fixed">
      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-slate-900/60 z-0"></div>

      {/* Abstract Background Gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-landing-accent/10 rounded-full blur-[120px] z-0 pointer-events-none" aria-hidden="true" />

      <Container className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center z-10">

        {/* Content Side */}
        <div className="flex flex-col items-start w-full max-w-2xl mx-auto lg:mx-0">

          <h1 className="text-[42px] sm:text-[46px] lg:text-[72px] font-editorial font-semibold text-white leading-[1] lg:leading-[0.98] tracking-[-0.035em] mb-5 max-w-[620px] text-balance perspective-[1000px] drop-shadow-md">
            <div className="hero-heading-line origin-bottom">Find the University</div>
            <div className="hero-heading-line origin-bottom text-white/90">That Fits Your Future.</div>
          </h1>

          <p className="hero-paragraph text-[16px] lg:text-[18px] text-white font-normal mb-8 max-w-[580px] text-balance leading-[1.65] drop-shadow-sm">
            Build your profile once and discover universities, programs, and study destinations matched to your goals.
          </p>

          <div className="flex flex-wrap gap-4 mb-4 lg:mb-0">
            <Button variant="primary" size="lg" className="hero-cta" onClick={() => window.location.href = '/register'}>
              Find My Universities
            </Button>
            <Button variant="secondary" size="lg" className="hero-cta" onClick={() => { document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Students Journey
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
