function makeIdFallback() {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += A[Math.floor(Math.random() * A.length)];
  return "BAY-AI-" + s + "-" + Date.now().toString(36).slice(-3).toUpperCase();
}

// Submits the registration. Tries the server API first (assigns a
// server-side, database-verified unique ID). If the server is unreachable
// (e.g. running the frontend alone, or offline), falls back to a locally
// generated ID so the participant is never blocked from getting their card.
export async function submitRegistration(payload) {
  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let msg = "status " + res.status;
      try { msg = (await res.json()).error || msg; } catch { /* body wasn't JSON */ }
      throw new Error(msg);
    }
    const data = await res.json();
    return { ...data, stored: true };
  } catch (err) {
    return { id: makeIdFallback(), issuedAt: new Date().toISOString(), stored: false, error: String(err.message || err) };
  }
}

export async function fetchRegistration(id) {
  const res = await fetch("/api/registration/" + encodeURIComponent(id));
  if (!res.ok) return null;
  return res.json();
}
