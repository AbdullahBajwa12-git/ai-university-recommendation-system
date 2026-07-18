import React, { useRef } from 'react';
import { gsap } from '../../animations/gsapSetup';
import { useGSAP } from '@gsap/react';
import { globeDestinations } from '../../data/heroGlobeData';
import { CountryFlag } from './CountryFlag';
import { AsiaCenteredMap } from './AsiaCenteredMap';
import { AirplaneIcon } from './AirplaneIcon';

export const StudyRouteGlobe = ({ isMobile }) => {
  const globeRef = useRef(null);

  useGSAP(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    globeDestinations.forEach((dest) => {
      const idPrefix = isMobile ? 'mobile' : 'desktop';
      const planeId = `#${idPrefix}-${dest.id}-plane`;
      const pathId = `#${idPrefix}-${dest.id}-path`;

      if (isReduced) {
        gsap.set(planeId, { visibility: 'visible' });
        const fadeId = `#${idPrefix}-${dest.id}-fade`;
        gsap.set(fadeId, { opacity: 1 });
        gsap.set(planeId, {
          motionPath: {
            path: pathId,
            align: pathId,
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
            start: isMobile ? dest.mobile.staticFallbackProgress : dest.desktop.staticFallbackProgress,
            end: isMobile ? dest.mobile.staticFallbackProgress : dest.desktop.staticFallbackProgress
          }
        });
      } else {
        const config = isMobile ? dest.mobile : dest.desktop;
        const duration = config.duration;
        const delay = config.delay + 3.0; // Wait for Hero entrance
        const fadeId = `#${idPrefix}-${dest.id}-fade`;

        const fadeInDuration = 0.4;
        const fadeOutDuration = 0.8;

        const tl = gsap.timeline({
          delay: delay,
          repeat: -1,
          repeatDelay: config.repeatDelay
        });

        tl.set(planeId, {
          visibility: 'visible',
          motionPath: {
            path: pathId,
            align: pathId,
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
            start: config.startProgress,
            end: config.startProgress
          }
        });

        tl.set(fadeId, { opacity: 0 });

        tl.to(fadeId, {
          opacity: 1,
          duration: fadeInDuration,
          ease: 'power1.out'
        }, 0);

        tl.to(planeId, {
          motionPath: {
            path: pathId,
            align: pathId,
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
            start: config.startProgress,
            end: config.endProgress
          },
          duration: duration,
          ease: "none"
        }, 0);

        tl.to(fadeId, {
          opacity: 0,
          duration: fadeOutDuration,
          ease: 'power1.in'
        }, duration - fadeOutDuration);

        tl.set(fadeId, { opacity: 0 });
      }
    });
  }, { scope: globeRef });

  return (
    <div
      ref={globeRef}
      className="relative w-full h-full flex items-center justify-center globe-wrapper"
      role="img"
      aria-label="StudyRoute university routes from Pakistan to the United Kingdom, Canada, Australia and the United States."
    >
      {/* Globe surface wrapper */}
      <div
        className="relative z-10 flex items-center justify-center"
        style={{
          width: isMobile ? '280px' : '380px',
          height: isMobile ? '280px' : '380px',
        }}
      >
        {/* Globe structural base */}
        <div
          className="hero-visual-el globe-surface absolute inset-0 border border-map-border rounded-full flex flex-col items-center justify-center bg-bg-surface backdrop-blur-md shadow-2xl overflow-hidden"
          style={{
            backgroundColor: 'var(--color-globe-surface)'
          }}
        >
        <div className="absolute inset-0 rounded-full blur-2xl opacity-5" style={{ backgroundColor: 'var(--color-landing-accent)' }} />

        {/* Scaled inline map to ensure Pakistan is visible and positioned nicely */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 globe-map scale-110">
          <AsiaCenteredMap />
        </div>

        {/* Map Styles for the inline SVG */}
        <style dangerouslySetInnerHTML={{__html: `
          .map-ocean { fill: transparent; }
          .map-graticule { stroke: var(--color-globe-grid); stroke-width: 0.5px; }
          .map-country { fill: var(--color-map-land); stroke: var(--color-map-border); stroke-width: 0.5px; }
          .map-pakistan { fill: var(--color-pakistan-highlight); stroke: var(--color-map-border); stroke-width: 0.5px; }
        `}} />

        {/* Pakistan Origin Pin */}
        <div className="pakistan-pin absolute top-[49%] left-[51%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
           <div className="relative flex items-center justify-center">
             <span className="absolute w-6 h-6 rounded-full bg-[var(--color-globe-origin-glow)] animate-pulse-slow" />
             <span className="w-2 h-2 rounded-full bg-landing-accent z-10 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
           </div>
           {/* Label for Pakistan */}
           <div className="mt-1.5 px-2 py-0.5 bg-bg-surface/80 border border-border-subtle rounded text-[9px] font-medium text-text-primary backdrop-blur-sm whitespace-nowrap">
             Pakistan
           </div>
        </div>

        </div>

        {/* "Let’s Study Abroad!" Heading */}
        <div
          className="globe-study-label absolute bottom-[calc(100%+16px)] lg:bottom-[calc(100%+24px)] left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
        >
          <h2 className="text-[20px] lg:text-[26px] font-editorial font-semibold text-white leading-[1.15] tracking-tight drop-shadow-sm">
            Your Study Journey Starts Here
          </h2>
        </div>
      </div>

      {/* Orbit Rings (decorative) removed per request */}

      {/* Connection Lines & Airplanes Overlay SVG */}
      <svg className="hero-visual-el absolute inset-0 w-full h-full z-20 pointer-events-none overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {globeDestinations.map((dest, index) => {
          const config = isMobile ? dest.mobile : dest.desktop;
          const pathD = config.path;
          const idPrefix = isMobile ? 'mobile' : 'desktop';
          const scale = config.planeScale;
          // SVG viewBox is 100x100, but planes need to be sized nicely. Since AirplaneIcon is 24x24 viewBox, we wrap it in a <g> and scale it.
          // In a 100x100 viewbox stretched to 500px, 1 unit = 5px. So an SVG of 4x4 units is 20x20px. We need a small plane.
          return (
            <g key={dest.id}>
              {/* Motion reference path - used by GSAP, hidden */}
              <path
                id={`${idPrefix}-${dest.id}-path`}
                d={pathD}
                fill="none"
                stroke="none"
              />

              {/* Smoke Layers Group */}
              <g className="route-path">
                {/* Wide Smoke Layer */}
                <path
                  className={`route-smoke ${isMobile ? 'opacity-40' : 'opacity-100'}`}
                  d={pathD}
                  fill="none"
                  stroke="var(--color-globe-route-smoke)"
                  strokeWidth={isMobile ? "1.5" : "2.2"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Main Vapor Layer */}
                <path
                  className="route-smoke animate-smoke-flow"
                  d={pathD}
                  fill="none"
                  stroke="var(--color-globe-route-vapor)"
                  strokeWidth={isMobile ? "0.5" : "0.75"}
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ '--duration': isMobile ? `${28 + index * 2}s` : `${22 + index * 2}s` }}
                />

                {/* Fine Highlight (Optional, desktop only for performance/clarity) */}
                {!isMobile && (
                  <path
                    className="route-smoke animate-smoke-flow"
                    d={pathD}
                    fill="none"
                    stroke="var(--color-globe-route-highlight)"
                    strokeWidth="0.25"
                    strokeDasharray="1 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ '--duration': `${16 + index * 1.5}s` }}
                  />
                )}
              </g>

              {/* Airplane */}
              <g
                id={`${idPrefix}-${dest.id}-plane`}
                className="motion-path-plane text-landing-accent"
                style={{ visibility: 'hidden' }}
              >
                <g id={`${idPrefix}-${dest.id}-fade`} style={{ opacity: 0 }}>
                  <g className="plane-scale-wrapper" transform={`translate(-2, -2) scale(${scale * 0.16})`}>
                    <AirplaneIcon width="24" height="24" />
                  </g>
                </g>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Destination Labels with Flags */}
      {globeDestinations.map((dest) => {
        const pos = isMobile ? dest.mobilePos : dest.desktopPos;
        return (
          <div
            key={dest.id}
            className={`hero-float dest-label absolute px-3 py-1.5 sm:px-4 sm:py-2 bg-bg-surface border border-border-subtle rounded-lg shadow-xl z-20 flex items-center gap-2`}
            style={pos}
          >
            <CountryFlag countryCode={dest.code} name={dest.name} className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium text-text-primary whitespace-nowrap">{dest.name}</span>
          </div>
        );
      })}
    </div>
  );
};
