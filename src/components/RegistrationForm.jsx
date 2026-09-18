import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import {
  COURSES, WORK, LEVELS, GADGETS, MODES, STARTER, BANK, emptyForm,
} from "../data/formOptions";
import { submitRegistration } from "../utils/api";

const STEP_TITLES = ["Who you are", "What you do now", "Tech & gadgets", "Courses & attendance", "Payment"];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [passportPreview, setPassportPreview] = useState(null);
  const [passportName, setPassportName] = useState("");
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [receiptName, setReceiptName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const stepRef = useRef(null);

  function set(field, value) {
    setData((d) => ({ ...d, [field]: value }));
  }
  function toggleArray(field, value) {
    setData((d) => {
      const arr = d[field].includes(value) ? d[field].filter((v) => v !== value) : [...d[field], value];
      return { ...d, [field]: arr };
    });
  }

  async function onPassport(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) { setErrors((er) => ({ ...er, passport: "Use a JPG or PNG photo of your face" })); return; }
    if (f.size > 12 * 1024 * 1024) { setErrors((er) => ({ ...er, passport: "Keep it under 12 MB" })); return; }
    const url = await fileToDataUrl(f);
    setPassportPreview(url);
    setPassportName(f.name);
    setErrors((er) => ({ ...er, passport: null }));
  }

  async function onReceipt(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (f.size > 15 * 1024 * 1024) { setErrors((er) => ({ ...er, receipt: "Keep it under 15 MB" })); return; }
    setReceiptName(f.name);
    if (/^image\//.test(f.type)) setReceiptPreview(await fileToDataUrl(f));
    else setReceiptPreview(null);
    setErrors((er) => ({ ...er, receipt: null }));
  }

  function validateStep(i) {
    const e = {};
    if (i === 0) {
      if (!data.fullname.trim()) e.fullname = "Enter your full name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) e.email = "Enter a valid email address.";
      if (data.phone.replace(/\D/g, "").length < 10) e.phone = "Enter your phone number.";
      if (!data.dob) e.dob = "Enter your date of birth.";
      if (!data.nationality.trim()) e.nationality = "Enter your nationality.";
      if (!data.address.trim()) e.address = "Tell us where you live.";
      if (!passportName) e.passport = "Upload a photograph of your face.";
    }
    if (i === 1) {
      if (!data.work) e.work = "Choose one.";
      if (!data.occupation.trim()) e.occupation = "Tell us what you do.";
    }
    if (i === 2) {
      if (!data.level) e.level = "Choose your level.";
      if (data.gadgets.length === 0) e.gadgets = "Pick at least one.";
      if (!data.internet) e.internet = "Choose one.";
      if (!data.starter) e.starter = "Choose one.";
    }
    if (i === 3) {
      if (data.courses.length === 0) e.courses = "Select at least one course.";
      if (!data.mode) e.mode = "Choose how you will attend.";
      if (!data.why.trim()) e.why = "Please answer this one.";
      if (!data.after.trim()) e.after = "Please answer this one.";
    }
    if (i === 4) {
      if (!data.payername.trim()) e.payername = "Enter the payer's name.";
      if (data.payref.trim().length < 4) e.payref = "Enter your payment reference.";
      if (!data.paydate) e.paydate = "Enter the date you paid.";
      if (!data.payamount.trim()) e.payamount = "Enter the amount.";
      if (!receiptName) e.receipt = "Upload proof of your ₦50,000 payment.";
      if (!data.dec1 || !data.dec2) e.declarations = "Tick both boxes to submit.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function animateStep(dir, after) {
    const el = stepRef.current;
    if (!el) { after(); return; }
    gsap.to(el, {
      opacity: 0, x: dir * -24, duration: 0.22, ease: "power2.in",
      onComplete: () => {
        after();
        gsap.fromTo(el, { opacity: 0, x: dir * 24 }, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out" });
      },
    });
  }

  function next() {
    if (!validateStep(step)) return;
    if (step < 4) animateStep(1, () => setStep((s) => s + 1));
  }
  function back() {
    if (step > 0) animateStep(-1, () => setStep((s) => s - 1));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validateStep(4)) return;
    setSubmitting(true);
    setSubmitError("");
    
    // UPDATED: Now successfully captures and sends the receipt preview image data
    const payload = { ...data, passportPhoto: passportPreview, receiptUrl: receiptPreview };
    
    const result = await submitRegistration(payload);
    setSubmitting(false);
    navigate(`/registration/${result.id}`, {
      state: {
        registration: { ...data, id: result.id, issuedAt: result.issuedAt },
        passportPhoto: passportPreview,
        // Not persisted server-side, so this only shows once, right after
        // submission — a page refresh or shared link won't carry it forward.
        storageError: result.stored ? null : (result.error || "unknown error"),
      },
    });
  }

  const cx = (base, bad) => base + (bad ? " bad" : "");

  return (
    <section className="band form-band" id="register">
      <div className="wrap">
        <div className="sec-eyebrow">Registration</div>
        <h2 className="sec-head">Register for the expedition</h2>
        <p className="sec-note">Move through the five short steps below — pay in step 5, then submit to generate your unique Registration ID and card.</p>

        <div className="stepper">
          {STEP_TITLES.map((t, i) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div className={`step-pill${i === step ? " active" : ""}${i < step ? " done" : ""}`}>
                <span className="n">{i < step ? "✓" : i + 1}</span>
                {t}
              </div>
              {i < STEP_TITLES.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} noValidate>
          <div className="step" ref={stepRef}>
            {step === 0 && (
              <>
                <div className="step-hd"><div className="step-no">1</div><div className="step-ti">Who you are</div></div>
                <p className="step-note">Use the name that appears on your ID — it goes on your certificate.</p>
                <div className="f"><label className="lb">Full name <span className="req">*</span></label>
                  <input className={cx("", errors.fullname)} type="text" value={data.fullname} onChange={(e) => set("fullname", e.target.value)} placeholder="Surname first" />
                  {errors.fullname && <div className="err">{errors.fullname}</div>}
                </div>
                <div className="grid2">
                  <div className="f"><label className="lb">Email address <span className="req">*</span></label>
                    <input type="email" value={data.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
                    {errors.email && <div className="err">{errors.email}</div>}
                  </div>
                  <div className="f"><label className="lb">Phone number <span className="req">*</span></label>
                    <input type="tel" value={data.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0801 234 5678" />
                    <p className="hint">Use your WhatsApp number — the group invite goes here.</p>
                    {errors.phone && <div className="err">{errors.phone}</div>}
                  </div>
                </div>
                <div className="grid2">
                  <div className="f"><label className="lb">Date of birth <span className="req">*</span></label>
                    <input type="date" value={data.dob} onChange={(e) => set("dob", e.target.value)} />
                    {errors.dob && <div className="err">{errors.dob}</div>}
                  </div>
                  <div className="f"><label className="lb">Gender</label>
                    <select value={data.gender} onChange={(e) => set("gender", e.target.value)}>
                      <option value="">Select</option><option>Male</option><option>Female</option><option>Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div className="grid2">
                  <div className="f"><label className="lb">Nationality <span className="req">*</span></label>
                    <input type="text" value={data.nationality} onChange={(e) => set("nationality", e.target.value)} />
                    {errors.nationality && <div className="err">{errors.nationality}</div>}
                  </div>
                  <div className="f"><label className="lb">State of origin</label>
                    <input type="text" value={data.stateorigin} onChange={(e) => set("stateorigin", e.target.value)} placeholder="Bayelsa" />
                  </div>
                </div>
                <div className="f"><label className="lb">Town / LGA where you live <span className="req">*</span></label>
                  <input type="text" value={data.address} onChange={(e) => set("address", e.target.value)} placeholder="e.g. Yenagoa, Yenagoa LGA" />
                  {errors.address && <div className="err">{errors.address}</div>}
                </div>
                <div className="f"><label className="lb">Passport photograph <span className="req">*</span></label>
                  <label className={`up${passportName ? " filled" : ""}`}>
                    <input type="file" accept="image/*" onChange={onPassport} />
                    <span className="up-ic" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </span>
                    <span className="up-tx">
                      <span className="up-t">{passportName ? "Passport photograph added" : "Upload your passport photograph"}</span>
                      <span className="up-d">{passportName || "A clear photo of your face, plain background"}</span>
                    </span>
                    {passportPreview && <img className="up-pv pv-pass on" src={passportPreview} alt="" />}
                  </label>
                  <p className="hint">This goes on your registration card and your certificate. Take it against a wall in good light.</p>
                  {errors.passport && <div className="err">{errors.passport}</div>}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="step-hd"><div className="step-no">2</div><div className="step-ti">What you do now</div></div>
                <p className="step-note">This helps us pitch the business side of the training correctly.</p>
                <div className="f"><label className="lb">Your current situation <span className="req">*</span></label>
                  <div className="opts opts-2">
                    {WORK.map((w) => (
                      <label className={`opt${data.work === w ? " checked" : ""}`} key={w}>
                        <input type="radio" name="work" checked={data.work === w} onChange={() => set("work", w)} /><span>{w}</span>
                      </label>
                    ))}
                  </div>
                  {errors.work && <div className="err">{errors.work}</div>}
                </div>
                <div className="f"><label className="lb">What exactly do you do? <span className="req">*</span></label>
                  <input type="text" value={data.occupation} onChange={(e) => set("occupation", e.target.value)} placeholder="e.g. Fashion designer, 300L student, bank teller" />
                  {errors.occupation && <div className="err">{errors.occupation}</div>}
                </div>
                <div className="f"><label className="lb">Name of your business, school or employer</label>
                  <input type="text" value={data.orgname} onChange={(e) => set("orgname", e.target.value)} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="step-hd"><div className="step-no">3</div><div className="step-ti">Your tech level and gadgets</div></div>
                <p className="step-note">Answer honestly. Beginners are welcome — we group people by level so nobody is left behind.</p>
                <div className="f"><label className="lb">Level of tech knowledge <span className="req">*</span></label>
                  <div className="opts">
                    {LEVELS.map((l) => (
                      <label className={`opt${data.level === l ? " checked" : ""}`} key={l}>
                        <input type="radio" name="level" checked={data.level === l} onChange={() => set("level", l)} /><span>{l}</span>
                      </label>
                    ))}
                  </div>
                  {errors.level && <div className="err">{errors.level}</div>}
                </div>
                <div className="f"><label className="lb">Gadgets you are bringing to the training <span className="req">*</span></label>
                  <div className="opts opts-2">
                    {GADGETS.map((g) => (
                      <label className={`opt${data.gadgets.includes(g) ? " checked" : ""}`} key={g}>
                        <input type="checkbox" checked={data.gadgets.includes(g)} onChange={() => toggleArray("gadgets", g)} /><span>{g}</span>
                      </label>
                    ))}
                  </div>
                  <p className="hint">Tick everything you will have with you.</p>
                  {errors.gadgets && <div className="err">{errors.gadgets}</div>}
                </div>
                <div className="f"><label className="lb">How reliable is your internet? <span className="req">*</span></label>
                  <select value={data.internet} onChange={(e) => set("internet", e.target.value)}>
                    <option value="">Select</option>
                    <option>Very reliable — always connected</option>
                    <option>Fairly reliable — occasional issues</option>
                    <option>Poor — I will need support</option>
                    <option>I use public or shared internet</option>
                  </select>
                  {errors.internet && <div className="err">{errors.internet}</div>}
                </div>
                <div className="f"><label className="lb">Do you want a starter pack? <span className="req">*</span></label>
                  <p className="hint" style={{ margin: "0 0 9px" }}>Tools, software access and templates to start earning after the training. Availability is limited and confirmed separately.</p>
                  <div className="opts opts-2">
                    {STARTER.map((s) => (
                      <label className={`opt${data.starter === s ? " checked" : ""}`} key={s}>
                        <input type="radio" name="starter" checked={data.starter === s} onChange={() => set("starter", s)} /><span>{s}</span>
                      </label>
                    ))}
                  </div>
                  {errors.starter && <div className="err">{errors.starter}</div>}
                </div>
                {data.starter.startsWith("Yes") && (
                  <div className="f"><label className="lb">What should the starter pack include?</label>
                    <input type="text" value={data.starterwhat} onChange={(e) => set("starterwhat", e.target.value)} placeholder="e.g. laptop support, AI tool subscriptions, editing templates" />
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <div className="step-hd"><div className="step-no">4</div><div className="step-ti">Your courses and how you will attend</div></div>
                <p className="step-note">Tick every course you want — your ₦50,000 covers all of them.</p>
                <div className="f"><label className="lb">Courses <span className="req">*</span></label>
                  <div className="tiles">
                    {COURSES.map(([t, d]) => {
                      const checked = data.courses.includes(t);
                      return (
                        <label className={`tile tile-select${checked ? " checked" : ""}`} key={t}>
                          <input type="checkbox" checked={checked} onChange={() => toggleArray("courses", t)} />
                          <span className="box" />
                          <span className="tl">{t}</span>
                          <span className="td">{d}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="hint" style={{ marginTop: 10 }}>{data.courses.length === 0 ? "No courses selected yet." : data.courses.length === COURSES.length ? "All seven courses selected — the full expedition." : `${data.courses.length} of 7 courses selected.`}</p>
                  {errors.courses && <div className="err">{errors.courses}</div>}
                </div>
                <div className="f"><label className="lb">Online or on-site? <span className="req">*</span></label>
                  <div className="opts">
                    {MODES.map(([t, d]) => (
                      <label className={`opt${data.mode === t ? " checked" : ""}`} key={t}>
                        <input type="radio" name="mode" checked={data.mode === t} onChange={() => set("mode", t)} />
                        <span>{t}{d ? <><br /><span style={{ fontSize: 13, color: "var(--muted)" }}>{d}</span></> : null}</span>
                      </label>
                    ))}
                  </div>
                  {errors.mode && <div className="err">{errors.mode}</div>}
                </div>
                <div className="f"><label className="lb">Why do you want to learn AI? <span className="req">*</span></label>
                  <textarea value={data.why} onChange={(e) => set("why", e.target.value)} placeholder="Tell us in your own words." />
                  {errors.why && <div className="err">{errors.why}</div>}
                </div>
                <div className="f"><label className="lb">What do you plan to do after the training? <span className="req">*</span></label>
                  <textarea value={data.after} onChange={(e) => set("after", e.target.value)} placeholder="Start a business, freelance, add it to your current job, teach others…" />
                  {errors.after && <div className="err">{errors.after}</div>}
                </div>
                <div className="f"><label className="lb">Anything we should know? Access needs, dietary needs, questions</label>
                  <textarea style={{ minHeight: 70 }} value={data.special} onChange={(e) => set("special", e.target.value)} />
                </div>
              </>
            )}

            {step === 4 && (
              <div className="pay">
                <div className="step-hd"><div className="step-no" style={{ background: "var(--gold)", color: "#12200F" }}>5</d
