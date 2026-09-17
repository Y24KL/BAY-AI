function makeIdFallback() {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += A[Math.floor(Math.random() * A.length)];
  return "BAY-AI-" + s + "-" + Date.now().toString(36).slice(-3).toUpperCase();
}

// Submits the registration. Tries the Netlify Function first (which assigns a
// server-side, storage-verified unique ID). If the function is unreachable
// (e.g. running outside Netlify, or offline), falls back to a locally
// generated ID so the participant is never blocked from getting their card.
export async function submitRegistration(payload) {
  try {
    const res = await fetch("/.netlify/functions/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("status " + res.status);
    const data = await res.json();
    return { ...data, stored: true };
  } catch (err) {
    return { id: makeIdFallback(), issuedAt: new Date().toISOString(), stored: false, error: String(err) };
  }
}

export async function fetchRegistration(id) {
  const res = await fetch("/.netlify/functions/get-registration?id=" + encodeURIComponent(id));
  if (!res.ok) return null;
  return res.json();
}
