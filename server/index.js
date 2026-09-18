import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { supabase } from "./supabaseServer.js";
import { isAdmin } from "./adminAuth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "15mb" })); // passport photo / receipt come in as data URLs

const TABLE = "registrations";
const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
const ID_LEN = 5;
const MAX_ID_ATTEMPTS = 12;

function randomIdSuffix() {
  let s = "";
  for (let i = 0; i < ID_LEN; i++) s += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)];
  return s;
}

const REQUIRED_FIELDS = [
  "fullname", "email", "phone", "dob", "nationality", "address",
  "occupation", "internet", "why", "after", "payername", "payref", "paydate", "payamount",
];

function toRow(id, body) {
  return {
    id,
    issued_at: new Date().toISOString(),
    fullname: body.fullname, email: body.email, phone: body.phone,
    dob: body.dob, gender: body.gender || "", nationality: body.nationality,
    stateorigin: body.stateorigin || "", address: body.address,
    work: body.work || "", occupation: body.occupation, orgname: body.orgname || "",
    level: body.level || "", gadgets: body.gadgets || [], internet: body.internet,
    starter: body.starter || "", starterwhat: body.starterwhat || "",
    courses: body.courses || [], mode: body.mode || "",
    why: body.why, after: body.after, special: body.special || "",
    payername: body.payername, payref: body.payref, paydate: body.paydate, payamount: body.payamount,
    passport_photo: body.passportPhoto || null,
    receipt_name: body.receiptName || "",
  };
}

function fromRow(row) {
  if (!row) return row;
  return { ...row, issuedAt: row.issued_at, passportPhoto: row.passport_photo, receiptName: row.receipt_name };
}

// ---- POST /api/register ----
app.post("/api/register", async (req, res) => {
  const body = req.body || {};
  for (const field of REQUIRED_FIELDS) {
    if (!body[field] || String(body[field]).trim() === "") {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }
  if (!Array.isArray(body.courses) || body.courses.length === 0) {
    return res.status(400).json({ error: "At least one course must be selected" });
  }

  let id = null;
  for (let attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt++) {
    const candidate = "BAY-AI-" + randomIdSuffix();
    const { data } = await supabase.from(TABLE).select("id").eq("id", candidate).maybeSingle();
    if (!data) { id = candidate; break; }
  }
  if (!id) return res.status(503).json({ error: "Could not allocate a unique ID, try again" });

  const row = toRow(id, body);
  const { error } = await supabase.from(TABLE).insert(row);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ id, issuedAt: row.issued_at, stored: true });
});

// ---- GET /api/registration/:id ----
app.get("/api/registration/:id", async (req, res) => {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", req.params.id).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Not found" });
  res.json(fromRow(data));
});

// ---- GET /api/admin/registrations ----
app.get("/api/admin/registrations", async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized access" });
  const { data, error } = await supabase.from(TABLE).select("*").order("issued_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(fromRow));
});

// ---- POST /api/admin/registrations/:id (edit) ----
app.post("/api/admin/registrations/:id", async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized access" });
  const patch = { ...req.body };
  delete patch.id; // id is never editable
  const { data, error } = await supabase.from(TABLE).update(patch).eq("id", req.params.id).select().maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true, registration: fromRow(data) });
});

// ---- DELETE /api/admin/registrations/:id ----
app.delete("/api/admin/registrations/:id", async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized access" });
  const { error } = await supabase.from(TABLE).delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ---- serve the built frontend ----
const distDir = path.join(__dirname, "..", "dist");
app.use(express.static(distDir));
app.get(/.*/, (req, res) => res.sendFile(path.join(distDir, "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
