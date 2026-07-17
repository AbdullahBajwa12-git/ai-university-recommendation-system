import { useGSAP } from "@gsap/react";
import { gsap } from "./gsapSetup";

export const useRevealAnimation = (ref, options = {}) => {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isReduced: "(prefers-reduced-motion: reduce)",
      isNormal: "(prefers-reduced-motion: no-preference)"
    }, (context) => {
      let { isReduced } = context.conditions;

      if (isReduced) {
        gsap.set(ref.current, { opacity: 1, y: 0, clearProps: 'transform' });
      } else {
        gsap.set(ref.current, { opacity: 0, y: 30 });
        gsap.to(ref.current, {
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
        });
      }
    });

    return () => mm.revert();
  }, { scope: ref });
};
