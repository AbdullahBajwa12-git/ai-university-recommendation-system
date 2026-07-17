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

      <Container className="relative z-10 text-center max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-editorial mb-6 text-balance">
          Your university search deserves a clearer route.
        </h2>
        <p className="text-lg md:text-xl text-text-secondary mb-10 text-balance leading-relaxed">
          Build your profile, explore suitable options and review guidance designed around your goals.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="primary" size="lg">
            Start Your Journey
          </Button>
          <Button variant="secondary" size="lg">
            Explore How It Works
          </Button>
        </div>
      </Container>
    </section>
  );
};
