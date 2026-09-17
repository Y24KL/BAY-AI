import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="wrap">
        <a href="#top" className="nav-brand">
          BAYELSA <span>AI</span>
        </a>
        <ul className="nav-links">
          <li><a href="#top">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#courses">Courses</a></li>
          <li><a href="#how">How it works</a></li>
        </ul>
        <a href="#register" className="btn btn-gold nav-cta">Register</a>
      </div>
    </nav>
  );
}
