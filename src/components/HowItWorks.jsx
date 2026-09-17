import { useRef } from "react";
import { useReveal } from "../lib/reveal";

const STEPS = [
  ["01", "Register", "Fill in your details and pick your courses."],
  ["02", "Pay & upload", "Transfer ₦50,000, then upload your receipt and passport photo."],
  ["03", "Get your ID", "Your unique Registration ID and digital card are generated instantly."],
  ["04", "Join the group", "Share your card and join the WhatsApp group for training-week details."],
];

export default function HowItWorks() {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section className="band" id="how" ref={ref} style={{ background: "var(--soft)" }}>
      <div className="wrap">
        <div className="sec-eyebrow" data-reveal>How it works</div>
        <h2 className="sec-head" data-reveal>Four steps to your seat</h2>
        <div className="tiles">
          {STEPS.map(([n, t, d]) => (
            <div className="tile" key={n} data-reveal>
              <div className="tile-n">{n}</div>
              <span className="tl">{t}</span>
              <span className="td">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
