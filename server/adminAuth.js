// Reads the admin login from Render env vars (Site → Environment) so no
// credential is ever hardcoded in source or shipped in the browser bundle.
// Set ADMIN_EMAIL / ADMIN_PASSWORD in Render; the defaults below only exist
// so the dashboard doesn't hard-fail before you've set them.
export function isAdmin(req) {
  const email = req.query.email || (req.body && req.body.email) || "";
  const pass = req.query.pass || (req.body && req.body.pass) || "";
  const wantEmail = process.env.ADMIN_EMAIL || "opujoedou@gmail.com";
  const wantPass = process.env.ADMIN_PASSWORD || "admin2026";
  return email === wantEmail && pass === wantPass;
}
