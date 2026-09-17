import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import gsap from "gsap";
import { drawRegistrationCard, loadImage } from "../utils/card";
import { registrationText } from "../utils/message";
import { fetchRegistration } from "../utils/api";
import { GROUP_LINK, NOTIFY_EMAIL } from "../data/formOptions";

export default function RegistrationSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const canvasRef = useRef(null);
  const rootRef = useRef(null);

  const [registration, setRegistration] = useState(location.state?.registration || null);
  const [passportPhoto, setPassportPhoto] = useState(location.state?.passportPhoto || null);
  const [status, setStatus] = useState(registration ? "ready" : "loading");
  const [copyLabel, setCopyLabel] = useState("Copy Registration ID");

  // If landed directly (refresh / shared link), fetch the stored record.
  useEffect(() => {
    if (registration) return;
    let alive = true;
    fetchRegistration(id).then((rec) => {
      if (!alive) return;
      if (rec) {
        setRegistration(rec);
        setPassportPhoto(rec.passportPhoto || null);
        setStatus("ready");
      } else {
        setStatus("not-found");
      }
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Draw the card once we have data.
  useEffect(() => {
    if (status !== "ready" || !registration) return;
    let cancelled = false;
    (async () => {
      let img = null;
      if (passportPhoto) {
        try { img = await loadImage(passportPhoto); } catch { /* ignore */ }
      }
      if (cancelled) return;
      drawRegistrationCard(canvasRef.current, { ...registration, id: registration.id || id }, img);
    })();
    return () => { cancelled = true; };
  }, [status, registration, passportPhoto, id]);

  // Cinematic entrance.
  useEffect(() => {
    if (status !== "ready") return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(".tick-wrap", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" })
        .fromTo(".success-title", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
        .fromTo(".regid-reveal", { opacity: 0, letterSpacing: "0.3em" }, { opacity: 1, letterSpacing: "0.04em", duration: 0.6 }, "-=0.1")
        .fromTo(".card-shell", { opacity: 0, scale: 0.94, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.6 }, "-=0.15")
        .fromTo(".success-actions .btn", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 }, "-=0.25");
    }, rootRef);
    return () => ctx.revert();
  }, [status]);

  function download() {
    const cv = canvasRef.current;
    cv.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bayelsa-AI-Training-${registration.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  function copyId() {
    navigator.clipboard?.writeText(registration.id).then(() => {
      setCopyLabel("Copied ✓");
      setTimeout(() => setCopyLabel("Copy Registration ID"), 1800);
    });
  }

  function whatsapp() {
    const text = registrationText({ ...registration, id: registration.id || id });
    navigator.clipboard?.writeText(text).finally(() => {
      window.open(GROUP_LINK, "_blank", "noopener");
    });
  }

  function email() {
    const subject = `AI Training Registration — ${registration.fullname} (${registration.id})`;
    const body = registrationText({ ...registration, id: registration.id || id }).replace(/\*/g, "").replace(/_/g, "");
    window.location.href = `mailto:${NOTIFY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  if (status === "loading") {
    return (
      <div className="success-page">
        <div className="wrap" style={{ textAlign: "center" }}>Loading your registration…</div>
      </div>
    );
  }
  if (status === "not-found") {
    return (
      <div className="success-page">
        <div className="wrap" style={{ textAlign: "center" }}>
          <p>We couldn't find a registration with ID <b>{id}</b>.</p>
          <Link className="btn btn-gold" to="/">Back to website</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page" ref={rootRef}>
      <div className="grain" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />
      <div className="wrap" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div className="tick-wrap">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#03210E" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h1 className="success-title" style={{ fontSize: "clamp(24px,5vw,34px)" }}>
          REGISTRATION COMPLETE<br />Welcome to the Bayelsa State Professional AI Training Expedition.
        </h1>
        <p style={{ color: "#9FD4B0", marginTop: 10 }}>Your registration has been successfully received.</p>
        <p style={{ color: "#9FD4B0", fontSize: 13, letterSpacing: ".18em", fontWeight: 700, marginTop: 30 }}>YOUR REGISTRATION ID</p>
        <div className="regid-reveal">{registration.id || id}</div>

        <div className="card-shell">
          <canvas ref={canvasRef} />
        </div>

        <div className="success-actions">
          <button className="btn btn-gold btn-wide" onClick={download}>↓ Download Registration Card</button>
          <button className="btn btn-green btn-wide" onClick={whatsapp}>WhatsApp Registration</button>
          <button className="btn btn-soft btn-wide" onClick={email}>Email Registration</button>
          <button className="btn btn-outline btn-wide" onClick={copyId} style={{ color: "#fff", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,.3)" }}>{copyLabel}</button>
          <Link className="btn btn-outline btn-wide" to="/" style={{ color: "#fff", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,.3)" }}>Back to website</Link>
        </div>
      </div>
    </div>
  );
}
