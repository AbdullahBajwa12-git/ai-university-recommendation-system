import React, { Suspense, lazy } from 'react';
import { Hero } from '../sections/home/Hero';

const BelowTheFold = lazy(() => import('../sections/home/BelowTheFold'));

const HomePage = () => {
  return (
    <div className="w-full">
      <Hero />
      <Suspense fallback={<div className="w-full min-h-screen bg-bg-base" />}>
        <BelowTheFold />
      </Suspense>
    </div>
  );
};

export default HomePage;
