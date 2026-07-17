import React, { useEffect } from 'react';
import { Preview } from './Preview';
import { RecommendationExperience } from './RecommendationExperience';
import { Destinations } from './Destinations';
import { ResponsibleGuidance } from './ResponsibleGuidance';
import { StudentJourney } from './StudentJourney';
import { FinalCTA } from './FinalCTA';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function BelowTheFold() {
  useEffect(() => {
    // Ensure ScrollTrigger refreshes after lazy content mounts
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Preview />
      <RecommendationExperience />
      <Destinations />
      <ResponsibleGuidance />
      <StudentJourney />
      <FinalCTA />
    </>
  );
}
