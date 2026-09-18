function niceDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  const M = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;
}

export function registrationText(r) {
  const L = [];
  L.push("*BAYELSA AI TRAINING EXPEDITION — REGISTRATION*");
  L.push("Reg ID: " + r.id);
  L.push("");
  L.push("*Name:* " + r.fullname);
  L.push("*Date of birth:* " + niceDate(r.dob));
  if (r.gender) L.push("*Gender:* " + r.gender);
  L.push("*Email:* " + r.email);
  L.push("*Phone:* " + r.phone);
  L.push("*Nationality:* " + r.nationality);
  if (r.stateorigin) L.push("*State of origin:* " + r.stateorigin);
  L.push("*Town / LGA:* " + r.address);
  L.push("");
  L.push("*Current situation:* " + r.work);
  L.push("*Occupation:* " + r.occupation);
  if (r.orgname) L.push("*Business / school / employer:* " + r.orgname);
  L.push("");
  L.push("*Tech level:* " + r.level);
  L.push("*Gadgets bringing:* " + (r.gadgets || []).join(", "));
  L.push("*Internet:* " + r.internet);
  L.push("*Starter pack:* " + r.starter + (r.starterwhat ? " — " + r.starterwhat : ""));
  L.push("");
  L.push("*Attending:* " + r.mode);
  L.push("*Courses (" + r.courses.length + "):*");
  r.courses.forEach((c) => L.push("  • " + c));
  L.push("");
  L.push("*Why AI:* " + r.why);
  L.push("*After the training:* " + r.after);
  if (r.special) L.push("*Notes:* " + r.special);
  L.push("");
  L.push("*PAYMENT*");
  if (r.paymethod === "venue") {
    L.push("Will pay ₦50,000 in cash at the venue on arrival.");
  } else {
    L.push("Paid by: " + r.payername);
    L.push("Reference: " + r.payref);
    L.push("Date paid: " + niceDate(r.paydate));
    L.push("Amount: ₦" + r.payamount);
    L.push("To: Parallex Bank / Joseph Opuene / 2000033733");
  }
  L.push("");
  L.push(r.paymethod === "venue"
    ? "_Attaching my passport photograph to this chat._"
    : "_Attaching my payment receipt and passport photograph to this chat._");
  return L.join("\n");
}

export { niceDate };
