import { useGSAP } from "@gsap/react";
import { gsap } from "./gsapSetup";

export const useRevealAnimation = (ref, options = {}) => {
  useGSAP(() => {
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
          ...options.scrollTrigger,
        },
        ...options,
      }
    );
  }, { scope: ref });
};
