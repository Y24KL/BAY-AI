import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { supabase } from "./supabaseServer.js";
import { isAdmin } from "./adminAuth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "25mb" })); // passport photo + receipt come in as data URLs

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
  "occupation", "internet", "why", "after",
];
const REQUIRED_PAY_NOW_FIELDS = ["payername", "payref", "paydate", "payamount"];

function toRow(id, body) {
  const payMethod = body.paymethod === "venue" ? "venue" : "now";
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
    payername: body.payername || "", payref: body.payref || "",
    paydate: body.paydate || null, payamount: body.payamount || "",
    passport_photo: body.passportPhoto || null,
    receipt_name: body.receiptName || "",
    receipt_file: body.receiptFile || null,
    pay_method: payMethod,
    payment_status: payMethod === "venue" ? "venue" : "pending",
  };
}

function fromRow(row) {
  if (!row) return row;
  return {
    ...row,
    issuedAt: row.issued_at,
    passportPhoto: row.passport_photo,
    receiptName: row.receipt_name,
    receiptFile: row.receipt_file,
    paymethod: row.pay_method || "now",
    paymentStatus: row.payment_status || "pending",
  };
}

// Fields an admin edit is allowed to write, mapped to their actual DB
// columns. Whitelisted on purpose: the object the client edits/holds also
// carries the camelCase aliases fromRow() adds (issuedAt, passportPhoto,
// etc.) alongside the raw snake_case columns, and passing that straight
// through to .update() would send unknown-column keys and error out.
const EDITABLE_FIELDS = {
  fullname: "fullname", email: "email", phone: "phone", dob: "dob", gender: "gender",
  nationality: "nationality", stateorigin: "stateorigin", address: "address", work: "work",
  occupation: "occupation", orgname: "orgname", level: "level", gadgets: "gadgets",
  internet: "internet", starter: "starter", starterwhat: "starterwhat", courses: "courses",
  mode: "mode", why: "why", after: "after", special: "special", payername: "payername",
  payref: "payref", paydate: "paydate", payamount: "payamount",
  paymentStatus: "payment_status",
};

function toPatch(body) {
  const patch = {};
  for (const key of Object.keys(EDITABLE_FIELDS)) {
    if (Object.prototype.hasOwnProperty.call(body, key)) patch[EDITABLE_FIELDS[key]] = body[key];
  }
  return patch;
}

// ---- POST /api/register ----
app.post("/api/register", async (req, res) => {
  const body = req.body || {};
  for (const field of REQUIRED_FIELDS) {
    if (!body[field] || String(body[field]).trim() === "") {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }
  const payMethod = body.paymethod === "venue" ? "venue" : "now";
  if (payMethod === "now") {
    for (const field of REQUIRED_PAY_NOW_FIELDS) {
      if (!body[field] || String(body[field]).trim() === "") {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
  }
  if (!Array.isArray(body.courses) || body.courses.length === 0) {
    return res.status(400).json({ error: "At least one course must be selected" });
  }

  let id = null;
  for (let attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt++) {
    const candidate = "BAY-AI-" + randomIdSuffix();
    const { data, error } = await supabase.from(TABLE).select("id").eq("id", candidate).maybeSingle();
    if (error) {
      console.error("[register] id-lookup error:", error.message);
      return res.status(500).json({ error: "Database error while allocating ID: " + error.message });
    }
    if (!data) { id = candidate; break; }
  }
  if (!id) return res.status(503).json({ error: "Could not allocate a unique ID, try again" });

  const row = toRow(id, body);
  const { error } = await supabase.from(TABLE).insert(row);
  if (error) {
    console.error("[register] insert error:", error.message, error.details || "");
    return res.status(500).json({ error: error.message });
  }

  res.json({ id, issuedAt: row.issued_at, stored: true });
});

// Columns for the admin list view — everything except the two large
// base64 blobs (passport photo, receipt file), which are only fetched when
// a specific registration is opened. Keeps the table fast to load even with
// many registrations.
const LIST_COLUMNS = [
  "id", "issued_at", "fullname", "email", "phone", "dob", "gender", "nationality",
  "stateorigin", "address", "work", "occupation", "orgname", "level", "gadgets",
  "internet", "starter", "starterwhat", "courses", "mode", "why", "after", "special",
  "payername", "payref", "paydate", "payamount", "receipt_name", "pay_method", "payment_status",
].join(",");

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
  const { data, error } = await supabase.from(TABLE).select(LIST_COLUMNS).order("issued_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(fromRow));
});

// ---- GET /api/admin/registrations/:id (full record, incl. photo/receipt) ----
app.get("/api/admin/registrations/:id", async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized access" });
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", req.params.id).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Not found" });
  res.json(fromRow(data));
});

// ---- POST /api/admin/registrations/:id (edit / approve) ----
app.post("/api/admin/registrations/:id", async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized access" });
  const patch = toPatch(req.body);
  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ error: "No editable fields in request body" });
  }
  const { data, error } = await supabase.from(TABLE).update(patch).eq("id", req.params.id).select().maybeSingle();
  if (error) {
    console.error("[admin update] error:", error.message);
    return res.status(500).json({ error: error.message });
  }
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
// Hashed files under /assets can be cached forever (their filename changes
// whenever their content does). index.html must never be cached, or the
// browser can keep serving a stale shell that points at an old, no-longer-
// deployed asset bundle after a new release goes out.
app.use(express.static(distDir, {
  setHeaders(res, filePath) {
    if (filePath.endsWith("index.html")) {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    } else {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  },
}));
app.get(/.*/, (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(distDir, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
