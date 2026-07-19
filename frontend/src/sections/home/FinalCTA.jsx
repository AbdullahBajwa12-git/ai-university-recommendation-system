import { useRef } from 'react';
import { Container } from '../../components/layout/Container';
import { Button } from '../../components/ui/Button';
import { useRevealAnimation } from '../../animations/useGsapAnimation';

export const FinalCTA = () => {
  const sectionRef = useRef(null);

  useRevealAnimation(sectionRef);

  return (
    <section id="cta" ref={sectionRef} className="py-24 lg:py-32 bg-bg-surface border-t border-border-subtle relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="w-[800px] h-[400px] bg-landing-accent/5 rounded-full blur-[100px]" />
      </div>

      <Container className="relative z-10 text-center max-w-[900px] mx-auto">
        <h2 className="text-[36px] lg:text-[52px] font-editorial font-semibold leading-[1.1] lg:leading-[1.08] mb-6 text-balance tracking-[-0.025em]">
          Make Your Next University Decision Clearer.
        </h2>
        <p className="text-[16px] lg:text-[18px] text-text-secondary mb-10 text-balance leading-[1.6]">
          Create your profile, explore suitable universities, and compare options based on what matters to you.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="primary" size="lg" onClick={() => window.location.href = '/register'}>
            Create My Profile
          </Button>
          <Button variant="secondary" size="lg" onClick={() => { document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>
            See How It Works
          </Button>
        </div>
      </Container>
    </section>
  );
};
