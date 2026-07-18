import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../animations/gsapSetup';
import { Container } from '../../components/layout/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { SectionLabel } from '../../components/ui/SectionLabel';

export const ResponsibleGuidance = () => {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isReduced: "(prefers-reduced-motion: reduce)",
      isNormal: "(prefers-reduced-motion: no-preference)"
    }, (context) => {
      let { isReduced } = context.conditions;

      if (!isReduced) {
        gsap.fromTo('.guidance-card',
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%'
            }
          }
        );

        // Radar/Scanner sweep animation
        gsap.to('.scanner-sweep', {
          rotate: 360,
          duration: 4,
          repeat: -1,
          ease: 'linear'
        });

        // Pulse animation for data nodes
        gsap.to('.data-node', {
          scale: 1.5,
          opacity: 0.4,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: 0.3
        });

      } else {
        gsap.set('.guidance-card', { opacity: 1, y: 0, clearProps: 'transform' });
      }
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section id="guidance" ref={sectionRef} className="py-24 lg:py-32 scroll-mt-20 bg-bg-surface relative border-t border-border-subtle overflow-hidden">

      {/* Premium Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-landing-accent/5 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-border-subtle),0.2)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none -z-10" />

      <Container className="relative z-10">

        {/* Top Section */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center mb-8 lg:mb-12">

          {/* Animated Shield / Radar UI */}
          <div className="w-full lg:w-1/3 flex justify-center lg:justify-center">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Outer Rings */}
              <div className="absolute inset-0 rounded-full border border-black/20" />
              <div className="absolute inset-4 rounded-full border border-black/20" />
              <div className="absolute inset-8 rounded-full border border-black/20" />

              {/* Radar Sweep */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="scanner-sweep absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-gradient-to-tr from-landing-accent/30 to-transparent origin-top-left opacity-60" />
              </div>

              {/* Data Nodes */}
              <div className="absolute top-[20%] left-[30%] w-2 h-2 rounded-full bg-landing-accent z-10">
                <div className="data-node absolute inset-0 rounded-full bg-landing-accent" />
              </div>
              <div className="absolute bottom-[25%] right-[25%] w-2 h-2 rounded-full bg-dest-1 z-10">
                <div className="data-node absolute inset-0 rounded-full bg-dest-1" />
              </div>
              <div className="absolute top-[40%] right-[15%] w-2 h-2 rounded-full bg-dest-2 z-10">
                <div className="data-node absolute inset-0 rounded-full bg-dest-2" />
              </div>

              {/* Center Core */}
              <div className="relative z-20 w-24 h-24 bg-bg-surface border-2 border-landing-accent/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(var(--color-landing-accent),0.3)] glass">
                <svg className="w-10 h-10 text-landing-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Heading Content */}
          <div className="w-full lg:w-2/3 text-center lg:text-left">

            <SectionHeading
              title="Ethical AI & Transparent Guidance"
              description="At StudyRoute, we believe your education decisions should be built on clarity, verified data, and absolute transparency. Our AI acts as a smart compass, empowering you without making false promises."
              alignment="left"
              className="mb-0 max-w-full"
            />
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">

          {/* Card 1 */}
          <div className="guidance-card relative p-8 rounded-2xl group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(var(--color-landing-accent),0.3)] z-10">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-landing-accent to-dest-1 pointer-events-none -z-20" style={{ padding: '1px' }}>
              <div className="w-full h-full bg-bg-surface rounded-2xl" />
            </div>
            <h4 className="text-text-primary font-medium text-lg mb-4 flex items-center relative z-10">
              <span className="w-10 h-10 rounded bg-landing-accent/10 text-landing-accent flex items-center justify-center mr-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              Source-Backed Information
            </h4>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed lg:pl-14 relative z-10">
              Our models process data directly curated from official university sources. While we strive for extreme accuracy, institutional policies evolve, so official websites should always be your final checkpoint.
            </p>
          </div>

          {/* Card 2 */}
          <div className="guidance-card relative p-8 rounded-2xl group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(var(--color-dest-1),0.3)] z-10">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-landing-accent to-dest-1 pointer-events-none -z-20" style={{ padding: '1px' }}>
              <div className="w-full h-full bg-bg-surface rounded-2xl" />
            </div>
            <h4 className="text-text-primary font-medium text-lg mb-4 flex items-center relative z-10">
              <span className="w-10 h-10 rounded bg-dest-1/10 text-dest-1 flex items-center justify-center mr-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              No False Guarantees
            </h4>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed lg:pl-14 relative z-10">
              We provide data-driven admission probabilities rather than false certainties. Real admissions depend on holistic institutional reviews, and we do not act as a final admission authority or guarantee visas.
            </p>
          </div>

          {/* Card 3 */}
          <div className="guidance-card relative p-8 rounded-2xl group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(var(--color-dest-2),0.3)] z-10">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-landing-accent to-dest-1 pointer-events-none -z-20" style={{ padding: '1px' }}>
              <div className="w-full h-full bg-bg-surface rounded-2xl" />
            </div>
            <h4 className="text-text-primary font-medium text-lg mb-4 flex items-center relative z-10">
              <span className="w-10 h-10 rounded bg-dest-2/10 text-dest-2 flex items-center justify-center mr-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </span>
              Data Privacy & Security
            </h4>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed lg:pl-14 relative z-10">
              Your academic background and budget preferences are securely encrypted. We only process your data to generate accurate university matches and never sell it to unauthorized third parties.
            </p>
          </div>

          {/* Card 4 */}
          <div className="guidance-card relative p-8 rounded-2xl group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(var(--color-landing-accent),0.3)] z-10">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-landing-accent to-dest-1 pointer-events-none -z-20" style={{ padding: '1px' }}>
              <div className="w-full h-full bg-bg-surface rounded-2xl" />
            </div>
            <h4 className="text-text-primary font-medium text-lg mb-4 flex items-center relative z-10">
              <span className="w-10 h-10 rounded bg-landing-accent/10 text-landing-accent flex items-center justify-center mr-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
              </span>
              Unbiased Matching
            </h4>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed lg:pl-14 relative z-10">
              Our algorithm is continuously monitored to prevent biased recommendations. We ensure that your StudyRoute matches are based purely on your merit, requirements, and objective institutional criteria.
            </p>
          </div>

        </div>

      </Container>
    </section>
  );
};
