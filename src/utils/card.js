import { niceDate } from "./message";

// Draws the reference-design registration card onto the given canvas.
// `passportImg` is an already-loaded HTMLImageElement or null.
export function drawRegistrationCard(canvas, r, passportImg) {
  const g = canvas.getContext("2d");
  const W = 1000;
  const n = r.courses.length;
  const H = 784 + 34 + n * 42 + 20 + 214 + 52 + 34 + 50 + 96;
  canvas.width = W;
  canvas.height = H;

  g.fillStyle = "#08150E";
  g.fillRect(0, 0, W, H);
  const grd = g.createRadialGradient(W * 0.92, 90, 20, W * 0.92, 90, 600);
  grd.addColorStop(0, "rgba(23,160,72,.38)");
  grd.addColorStop(1, "rgba(23,160,72,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, W, 700);

  function T(txt, x, y, size, color, font, spacing) {
    g.fillStyle = color;
    g.font = font || `700 ${size}px Inter, sans-serif`;
    if (spacing) {
      let cx = x;
      String(txt).split("").forEach((ch) => {
        g.fillText(ch, cx, y);
        cx += g.measureText(ch).width + spacing;
      });
    } else g.fillText(txt, x, y);
  }

  const M = 62;
  T("SKILLS TODAY, GREATER TOMORROW", M, 84, 19, "#9FD4B0", '700 19px Inter, sans-serif', 4.2);
  g.fillStyle = "#17A048";
  g.fillRect(M, 104, 70, 5);

  T("BAYELSA STATE", M, 178, 58, "#FFFFFF", '400 58px "Archivo Black", Impact, sans-serif');
  T("PROFESSIONAL", M, 216, 20, "#FFFFFF", '600 20px Inter, sans-serif', 9);
  T("AI TRAINING", M, 276, 58, "#17A048", '400 58px "Archivo Black", Impact, sans-serif');

  g.fillStyle = "#F5B324";
  g.fillRect(M, 300, 268, 44);
  T("EXPEDITION", M + 18, 331, 21, "#12200F", '800 21px Inter, sans-serif', 7.5);

  if (passportImg) {
    const px = 712, py = 62, pw = 226, ph = 286;
    g.save();
    g.beginPath();
    g.rect(px, py, pw, ph);
    g.clip();
    const sc = Math.max(pw / passportImg.width, ph / passportImg.height);
    const dw = passportImg.width * sc, dh = passportImg.height * sc;
    g.drawImage(passportImg, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
    g.restore();
    g.strokeStyle = "#17A048";
    g.lineWidth = 5;
    g.strokeRect(px - 2.5, py - 2.5, pw + 5, ph + 5);
  }

  T("REGISTRATION CARD", M, 402, 20, "#9FD4B0", '700 20px Inter, sans-serif', 5);
  g.strokeStyle = "rgba(159,212,176,.30)";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(M, 424);
  g.lineTo(W - M, 424);
  g.stroke();

  let y = 486;
  function row(k, v, big) {
    T(k, M, y, 19, "#9FD4B0", '700 19px Inter, sans-serif', 3.4);
    y += big ? 46 : 38;
    g.fillStyle = "#FFFFFF";
    g.font = big ? '400 42px "Archivo Black", Impact, sans-serif' : '600 27px Inter, sans-serif';
    let s = String(v);
    const maxW = W - M * 2;
    while (g.measureText(s).width > maxW && s.length > 6) s = s.slice(0, -2);
    if (s !== String(v)) s = s.trim() + "…";
    g.fillText(s, M, y);
    y += big ? 58 : 52;
  }
  row("PARTICIPANT", r.fullname, true);
  row("DATE OF BIRTH", niceDate(r.dob));
  row("REGISTRATION ID", r.id, true);

  T("COURSES SELECTED  (" + r.courses.length + ")", M, y, 19, "#9FD4B0", '700 19px Inter, sans-serif', 3.4);
  y += 34;
  r.courses.forEach((c) => {
    g.fillStyle = "#17A048";
    g.beginPath();
    g.arc(M + 8, y - 8, 6, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#FFFFFF";
    g.font = '600 25px Inter, sans-serif';
    let s = c;
    const maxW = W - M * 2 - 32;
    while (g.measureText(s).width > maxW && s.length > 6) s = s.slice(0, -2);
    if (s !== c) s = s.trim() + "…";
    g.fillText(s, M + 30, y);
    y += 42;
  });

  y += 20;
  g.fillStyle = "rgba(255,255,255,.055)";
  const bx = M, bw = W - M * 2, bh = 214;
  g.fillRect(bx, y, bw, bh);
  g.strokeStyle = "rgba(159,212,176,.28)";
  g.lineWidth = 2;
  g.strokeRect(bx, y, bw, bh);
  let iy = y + 52;
  function inner(k, v) {
    T(k, bx + 30, iy, 18, "#9FD4B0", '700 18px Inter, sans-serif', 3);
    g.fillStyle = "#FFFFFF";
    g.font = '700 25px Inter, sans-serif';
    let s = String(v);
    const maxW = bw - 330;
    while (g.measureText(s).width > maxW && s.length > 6) s = s.slice(0, -2);
    if (s !== String(v)) s = s.trim() + "…";
    g.textAlign = "right";
    g.fillText(s, bx + bw - 30, iy);
    g.textAlign = "left";
    iy += 52;
  }
  inner("ATTENDING", r.mode.indexOf("Online") === 0 ? "Online" : r.mode.indexOf("Either") === 0 ? "Online or on-site" : "On-site, Yenagoa");
  inner("TRAINING WEEK", "First week of October 2026");
  inner("VENUE", "Ebitari Hotel, Yenagoa");
  inner("FEE STATUS", "₦50,000 — pending confirmation");

  y += bh + 66;
  g.fillStyle = "#9FD4B0";
  g.font = '500 21px Inter, sans-serif';
  g.fillText("Payment reference: " + r.payref, M, y);
  y += 34;
  g.fillText("Issued: " + new Date(r.issuedAt || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), M, y);

  g.fillStyle = "#17A048";
  g.fillRect(0, H - 96, W, 96);
  g.fillStyle = "#03210E";
  g.font = '800 27px Inter, sans-serif';
  g.textAlign = "center";
  g.fillText("Be Part of A Smarter Bayelsa", W / 2, H - 56);
  g.font = '600 20px Inter, sans-serif';
  g.fillText("Powered by Lightfounders AI School Lagos", W / 2, H - 26);
  g.textAlign = "left";
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
