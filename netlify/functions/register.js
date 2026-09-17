import { getStore } from "@netlify/blobs";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — avoids lookalike mistakes
const ID_LEN = 5;
const MAX_ATTEMPTS = 12;

function randomSuffix() {
  let s = "";
  for (let i = 0; i < ID_LEN; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}

const REQUIRED = ["fullname", "email", "phone", "dob", "nationality", "address", "occupation", "internet", "why", "after", "payername", "payref", "paydate", "payamount"];

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  for (const field of REQUIRED) {
    if (!body[field] || String(body[field]).trim() === "") {
      return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), { status: 400 });
    }
  }
  if (!Array.isArray(body.courses) || body.courses.length === 0) {
    return new Response(JSON.stringify({ error: "At least one course must be selected" }), { status: 400 });
  }

  const store = getStore("bay-ai-registrations");

  // Guarantee a unique ID by checking the blob store — retry on collision.
  let id = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = "BAY-AI-" + randomSuffix();
    const existing = await store.get(candidate);
    if (existing === null) {
      id = candidate;
      break;
    }
  }
  if (!id) {
    return new Response(JSON.stringify({ error: "Could not allocate a unique ID, try again" }), { status: 503 });
  }

  const record = {
    id,
    issuedAt: new Date().toISOString(),
    fullname: body.fullname, email: body.email, phone: body.phone,
    dob: body.dob, gender: body.gender || "", nationality: body.nationality,
    stateorigin: body.stateorigin || "", address: body.address,
    work: body.work || "", occupation: body.occupation, orgname: body.orgname || "",
    level: body.level || "", gadgets: body.gadgets || [], internet: body.internet,
    starter: body.starter || "", starterwhat: body.starterwhat || "",
    courses: body.courses, mode: body.mode || "",
    why: body.why, after: body.after, special: body.special || "",
    payername: body.payername, payref: body.payref, paydate: body.paydate, payamount: body.payamount,
    passportPhoto: body.passportPhoto || null, // data URL, stored for the /registration/:id page
    receiptName: body.receiptName || "",
  };

  await store.setJSON(id, record);
  // also index by payment reference for admin lookups later
  try {
    await store.setJSON("payref:" + body.payref, { id });
  } catch {
    // non-fatal
  }

  return new Response(JSON.stringify({ id, issuedAt: record.issuedAt, stored: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
