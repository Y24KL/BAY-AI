import { useRef } from "react";
import { COURSES } from "../data/formOptions";
import { useReveal } from "../lib/reveal";

export default function Courses() {
  const ref = useRef(null);
  useReveal(ref);

  return (
    <section className="band" id="courses" ref={ref}>
      <div className="wrap">
        <div className="sec-eyebrow" data-reveal>What you'll learn</div>
        <h2 className="sec-head" data-reveal>Seven courses. One registration.</h2>
        <p className="sec-note" data-reveal>Your ₦50,000 covers every course listed here. Pick as many as you like when you register — take all seven if you want the full expedition.</p>
        <div className="tiles">
          {COURSES.map((c, i) => (
            <div className="tile" key={c[0]} data-reveal>
              <div className="tile-n">{String(i + 1).padStart(2, "0")}</div>
              <span className="tl">{c[0]}</span>
              <span className="td">{c[1]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
