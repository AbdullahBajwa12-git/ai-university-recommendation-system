import { useState, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../animations/gsapSetup';
import { Container } from './Container';
import { Button } from '../ui/Button';
import studyrouteLogoLight from '../../assets/brand/studyroute-logo-light.png';
import { navLinks } from '../../data/homepageData';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const menuRef = useRef(null);
  const menuInnerRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Handle scroll state for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Entrance animation
  useGSAP(() => {
    gsap.fromTo(navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
    );
  }, { scope: navRef });

  // Mobile menu animation
  useGSAP(() => {
    if (isOpen) {
      gsap.to(menuRef.current, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(menuInnerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', delay: 0.1 }
      );
    } else {
      gsap.to(menuRef.current, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' });
    }
  }, [isOpen]);

  return (
    <header
      ref={navRef}
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        scrolled ? 'bg-bg-base/80 backdrop-blur-md border-b border-border-subtle' : 'bg-transparent'
      }`}
    >
      <Container>
        <nav className="flex items-center justify-between h-20" aria-label="Main Navigation">
          {/* Logo */}
          <a href="/" className="outline-none-focus rounded flex items-center" onClick={closeMenu}>
            <img
              src={studyrouteLogoLight}
              alt="StudyRoute"
              className="w-[130px] sm:w-[145px] lg:w-[165px] h-auto object-contain"
            />
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <ul className="flex space-x-8">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors outline-none-focus rounded px-2 py-1"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center space-x-4">
              <a
                href="/login"
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors outline-none-focus rounded px-2 py-1"
              >
                Sign In
              </a>
              <Button size="sm" onClick={() => window.location.href = '/login'}>Find Universities</Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-text-primary outline-none-focus rounded"
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            <div className="w-6 h-5 flex flex-col justify-between relative">
              <span className={`block h-0.5 w-full bg-current transition-transform duration-300 ${isOpen ? 'translate-y-2.5 rotate-45' : ''}`} />
              <span className={`block h-0.5 w-full bg-current transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-full bg-current transition-transform duration-300 ${isOpen ? '-translate-y-2 -rotate-45' : ''}`} />
            </div>
          </button>
        </nav>
      </Container>

      {/* Mobile Menu Panel */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className="fixed inset-0 top-20 bg-bg-base/95 backdrop-blur-xl z-40 invisible md:hidden h-[calc(100vh-5rem)] overflow-y-auto"
        aria-hidden={!isOpen}
      >
        <Container className="h-full flex flex-col pt-8 pb-12">
          <div ref={menuInnerRef} className="flex flex-col space-y-6 flex-grow">
            <ul className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="block text-2xl font-editorial text-text-secondary hover:text-landing-accent transition-colors py-2 outline-none-focus rounded"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="pt-8 border-t border-border-subtle mt-auto flex flex-col space-y-4">
              <a
                href="/login"
                className="block text-center text-lg font-medium text-text-secondary hover:text-text-primary transition-colors py-2 outline-none-focus rounded"
                onClick={closeMenu}
              >
                Sign In
              </a>
              <Button className="w-full" onClick={() => { closeMenu(); window.location.href = '/login'; }}>
                Find Universities
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
};
