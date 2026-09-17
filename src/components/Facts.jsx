const FACTS = [
  { k: "Training fee", v: "₦50,000", n: "All seven courses, full week" },
  { k: "Training week", v: "First week, October 2026", n: "Exact days sent to registered participants" },
  { k: "Venue", v: "Ebitari Hotel", n: "Yenagoa, Bayelsa State — or join online" },
  { k: "Registration closes", v: "30th September", n: "Or when the 150 slots fill" },
];

export default function Facts() {
  return (
    <section className="facts" id="about">
      <div className="wrap" style={{ padding: 0 }}>
        <div className="facts-grid">
          {FACTS.map((f) => (
            <div className="fact" key={f.k}>
              <div className="fact-k">{f.k}</div>
              <div className="fact-v">{f.v}</div>
              <div className="fact-n">{f.n}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
