import { useEffect, useRef } from "react";
import { gsap } from "../lib/reveal";

export default function Hero() {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(".eyebrow", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 })
        .fromTo(".lock1, .lock2, .lock3, .lock4", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, "-=0.2")
        .fromTo(".hero-sub, .hero-verbs", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06 }, "-=0.3")
        .fromTo(".promise", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.3")
        .fromTo(".slots", { opacity: 0, scale: 0.9, rotate: -6 }, { opacity: 1, scale: 1, rotate: -1.2, duration: 0.5 }, "-=0.3")
        .fromTo(".hero-cta .btn", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, "-=0.2");
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <header className="hero" id="top" ref={ref}>
      <div className="grain" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-glow2" aria-hidden="true" />
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <div className="eyebrow"><span>Skills today</span><span>Greater tomorrow</span></div>
        <div className="rule-short" />
        <h1 className="lock1">BAYELSA STATE</h1>
        <div className="lock2">PROFESSIONAL</div>
        <h1 className="lock3">AI TRAINING</h1>
        <div className="lock4">EXPEDITION</div>
        <div className="hero-sub">A 1-WEEK FULL COURSE AI TRAINING PROGRAM</div>
        <div className="hero-verbs">Learn<b>|</b>Create<b>|</b>Innovate<b>|</b>Earn</div>
        <h2 className="promise">Become your <em>own boss</em> and be financially stable.</h2>
        <div className="slots">ONLY <b>150</b> SLOTS LEFT</div>
        <div className="hero-cta">
          <a className="btn btn-gold" href="#register">Register now</a>
          <a className="btn btn-ghost" href="#courses">See the courses</a>
        </div>
      </div>
    </header>
  );
}
