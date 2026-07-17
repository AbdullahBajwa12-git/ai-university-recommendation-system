import { useEffect, useRef } from 'react';
import { ReactLenis } from 'lenis/react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { gsap, ScrollTrigger } from '../animations/gsapSetup';
import 'lenis/dist/lenis.css';

const MainLayout = () => {
  const lenisRef = useRef(null);

  useEffect(() => {
    // 1. Stable reference for GSAP ticker
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      // 2. Explicit removal of exactly that reference
      gsap.ticker.remove(update);
    };
  }, []);

  useEffect(() => {
    const lenisInstance = lenisRef.current?.lenis;
    if (!lenisInstance) return;

    // Stable reference for scroll listener
    function onScroll() {
      ScrollTrigger.update();
    }

    lenisInstance.on('scroll', onScroll);

    return () => {
      // 3. Explicit removal of Lenis scroll listener
      lenisInstance.off('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const refresh = () => {
      if (!cancelled) {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      }
    };

    document.fonts?.ready?.then(refresh);
    window.addEventListener('load', refresh);
    window.addEventListener('resize', refresh);

    const timer = window.setTimeout(refresh, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener('load', refresh);
      window.removeEventListener('resize', refresh);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        smoothWheel: true,
      }}
    >
      <div className="landing-page">
        <div className="min-h-screen flex flex-col bg-bg-base text-text-primary">
          <Navbar />

          <main className="flex-grow">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>
    </ReactLenis>
  );
};

export default MainLayout;
