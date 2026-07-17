export const globeDestinations = [
  {
    id: 'route-uk',
    name: 'United Kingdom',
    code: 'GB',
    desktopPos: { top: '15%', left: '10%' },
    mobilePos: { top: '25%', left: '6%' },
    desktop: {
      path: 'M 51 49 Q 25 10 10 15',
      duration: 11,
      delay: 0,
      staticFallbackProgress: 0.8,
      planeScale: 1,
      startProgress: 0.08,
      endProgress: 0.88,
      repeatDelay: 1.5
    },
    mobile: {
      path: 'M 51 49 Q 25 15 6 25',
      duration: 14,
      delay: 0,
      staticFallbackProgress: 0.8,
      planeScale: 0.7,
      startProgress: 0.10,
      endProgress: 0.75, // Stop right before the UK mobile label
      repeatDelay: 1.5
    }
  },
  {
    id: 'route-canada',
    name: 'Canada',
    code: 'CA',
    desktopPos: { bottom: '25%', left: '0%' }, // top: 75%, left: 0%
    mobilePos: { top: '66%', left: '4%' },
    desktop: {
      path: 'M 51 49 Q 20 80 0 75',
      duration: 13,
      delay: 2.5,
      staticFallbackProgress: 0.6,
      planeScale: 1,
      startProgress: 0.12, // Start past Pakistan
      endProgress: 0.82,   // End before Canada pill
      repeatDelay: 2.5
    },
    mobile: {
      path: 'M 51 49 Q 20 70 4 66',
      duration: 16,
      delay: 2.5,
      staticFallbackProgress: 0.6,
      planeScale: 0.7,
      startProgress: 0.08,
      endProgress: 0.88,
      repeatDelay: 2.5
    }
  },
  {
    id: 'route-australia',
    name: 'Australia',
    code: 'AU',
    desktopPos: { top: '35%', right: '0%' }, // top: 35%, left: 100%
    mobilePos: { top: '28%', right: '6%' }, // top: 28%, left: 94%
    desktop: {
      path: 'M 51 49 Q 80 15 100 35',
      duration: 10,
      delay: 1.2,
      staticFallbackProgress: 0.9,
      planeScale: 1,
      startProgress: 0.08,
      endProgress: 0.88,
      repeatDelay: 1.2
    },
    mobile: {
      path: 'M 51 49 Q 80 20 94 28',
      duration: 13,
      delay: 1.2,
      staticFallbackProgress: 0.9,
      planeScale: 0.7,
      startProgress: 0.08,
      endProgress: 0.88,
      repeatDelay: 1.2
    }
  },
  {
    id: 'route-us',
    name: 'United States',
    code: 'US',
    desktopPos: { bottom: '15%', right: '20%' }, // top: 85%, left: 80%
    mobilePos: { top: '72%', right: '4%' }, // top: 72%, left: 96%
    desktop: {
      path: 'M 51 49 Q 90 70 80 85',
      duration: 14,
      delay: 4.0,
      staticFallbackProgress: 0.7,
      planeScale: 1,
      startProgress: 0.08,
      endProgress: 0.85, // US end progress optimized
      repeatDelay: 2.0
    },
    mobile: {
      path: 'M 51 49 Q 85 80 96 72',
      duration: 17,
      delay: 4.0,
      staticFallbackProgress: 0.7,
      planeScale: 0.7,
      startProgress: 0.08,
      endProgress: 0.88,
      repeatDelay: 2.0
    }
  }
];
