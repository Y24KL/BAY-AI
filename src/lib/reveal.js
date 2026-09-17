import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Applies a tasteful fade/rise-in to every [data-reveal] element inside `ref`.
export function useReveal(ref, deps = []) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll("[data-reveal]");
    const triggers = [];
    els.forEach((el, i) => {
      const tween = gsap.fromTo(
        el,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          delay: (i % 6) * 0.05,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
      triggers.push(tween.scrollTrigger);
    });
    return () => triggers.forEach((t) => t && t.kill());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export { gsap, ScrollTrigger };
