import { useState } from "react";
import QRCode from "qrcode";

const FN = (params) => `/api/admin/registrations?${new URLSearchParams(params)}`;
const FN_ID = (id, params) => `/api/admin/registrations/${encodeURIComponent(id)}?${new URLSearchParams(params)}`;

function StatusBadge({ reg }) {
  const s = reg.paymethod === "venue" ? "venue" : (reg.paymentStatus === "approved" ? "approved" : "pending");
  const styles = {
    approved: { background: "rgba(23,160,72,.15)", color: "var(--green-bright, #17A048)", label: "Approved" },
    pending: { background: "rgba(245,179,36,.15)", color: "var(--gold, #F5B324)", label: "Pending" },
    venue: { background: "rgba(157,176,163,.15)", color: "var(--muted, #9DB0A3)", label: "Pay at venue" },
  }[s];
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: styles.background, color: styles.color }}>
      {styles.label}
    </span>
  );
}

function ReceiptViewer({ reg }) {
  if (reg.paymethod === "venue") {
    return <p style={{ color: "var(--muted, #9DB0A3)" }}>No receipt — this participant is paying ₦50,000 at the venue.</p>;
  }
  if (!reg.receiptFile) {
    return <p style={{ color: "var(--muted, #9DB0A3)" }}>No receipt file was saved for this registration{reg.receiptName ? ` (filename on record: ${reg.receiptName})` : ""}.</p>;
  }
  const isPdf = reg.receiptFile.startsWith("data:application/pdf");
  if (isPdf) {
    return (
      <a href={reg.receiptFile} download={reg.receiptName || "receipt.pdf"} target="_blank" rel="noreferrer"
        className="inline-block px-4 py-2 rounded-lg font-semibold" style={{ background: "var(--soft, #111E16)", border: "1px solid var(--line, #26382C)", color: "var(--gold, #F5B324)" }}>
        Open receipt PDF ({reg.receiptName || "download"})
      </a>
    );
  }
  return (
    <a href={reg.receiptFile} target="_blank" rel="noreferrer">
      <img src={reg.receiptFile} alt="Payment receipt" className="rounded-lg max-h-96" style={{ border: "1px solid var(--line, #26382C)" }} />
    </a>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="text-xs font-bold uppercase" style={{ color: "var(--muted, #9DB0A3)", letterSpacing: ".05em" }}>{label}</div>
      <div>{value}</div>
    </div>
  );
}

function DetailModal({ reg, onClose, onApprove, busy, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,.65)" }} onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl p-6 sm:p-8 my-8" style={{ background: "var(--ink, #04100A)", border: "1px solid var(--line, #26382C)", color: "#EAF2EC" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-xs font-bold tracking-[.2em]" style={{ color: "var(--gold, #F5B324)" }}>{reg.id}</div>
            <h2 className="text-2xl font-black mt-1">{reg.fullname}</h2>
            <div className="mt-2"><StatusBadge reg={reg} /></div>
          </div>
          <button onClick={onClose} className="text-2xl leading-none" style={{ color: "var(--muted, #9DB0A3)" }}>&times;</button>
        </div>

        {loading ? (
          <p style={{ color: "var(--muted, #9DB0A3)" }}>Loading photo and receipt…</p>
        ) : reg.passportPhoto && (
          <img src={reg.passportPhoto} alt="Passport" className="rounded-lg mb-6 max-h-48" style={{ border: "1px solid var(--line, #26382C)" }} />
        )}

        <div className="grid sm:grid-cols-2 gap-x-6">
          <DetailRow label="Email" value={reg.email} />
          <DetailRow label="Phone" value={reg.phone} />
          <DetailRow label="Date of birth" value={reg.dob} />
          <DetailRow label="Gender" value={reg.gender} />
          <DetailRow label="Nationality" value={reg.nationality} />
          <DetailRow label="State of origin" value={reg.stateorigin} />
          <DetailRow label="Address" value={reg.address} />
          <DetailRow label="Occupation" value={reg.occupation} />
          <DetailRow label="Employer / school" value={reg.orgname} />
          <DetailRow label="Attendance" value={reg.mode} />
        </div>

        {Array.isArray(reg.courses) && reg.courses.length > 0 && (
          <div style={{ marginTop: 6, marginBottom: 10 }}>
            <div className="text-xs font-bold uppercase" style={{ color: "var(--muted, #9DB0A3)", letterSpacing: ".05em" }}>Courses ({reg.courses.length})</div>
            <ul className="list-disc pl-5 mt-1">
              {reg.courses.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        )}

        <hr style={{ borderColor: "var(--line, #26382C)", margin: "18px 0" }} />

        <h3 className="font-bold mb-3">Payment</h3>
        {reg.paymethod === "venue" ? (
          <p style={{ color: "var(--gold, #F5B324)", fontWeight: 600 }}>Will pay ₦50,000 in cash at the venue on arrival.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-x-6 mb-4">
            <DetailRow label="Paid by" value={reg.payername} />
            <DetailRow label="Reference" value={reg.payref} />
            <DetailRow label="Date paid" value={reg.paydate} />
            <DetailRow label="Amount" value={reg.payamount ? "₦" + reg.payamount : ""} />
          </div>
        )}

        <div style={{ marginTop: 10 }}>
          {loading ? <p style={{ color: "var(--muted, #9DB0A3)" }}>Loading receipt…</p> : <ReceiptViewer reg={reg} />}
        </div>

        {reg.paymethod !== "venue" && (
          <div className="mt-6">
            {reg.paymentStatus === "approved" ? (
              <p className="font-bold" style={{ color: "var(--green-bright, #17A048)" }}>✓ Payment approved</p>
            ) : (
              <button onClick={() => onApprove(reg.id)} disabled={busy} className="px-5 py-2.5 rounded-lg font-bold" style={{ background: "var(--gold, #F5B324)", color: "#12200F" }}>
                {busy ? "Approving…" : "Approve payment"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creds, setCreds] = useState(null); // { email, pass } once verified — kept in memory only
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [viewingReg, setViewingReg] = useState(null);
  const [viewingLoading, setViewingLoading] = useState(false);

  async function loadRegistrations(c) {
    const res = await fetch(FN(c));
    if (!res.ok) throw new Error(res.status === 401 ? "Invalid email or password" : "Could not load registrations");
    return res.json();
  }

  async function handleView(reg) {
    setViewingReg(reg); // show the lightweight row immediately, then fill in the rest
    setViewingLoading(true);
    try {
      const res = await fetch(FN_ID(reg.id, creds));
      if (!res.ok) throw new Error("Could not load full details");
      setViewingReg(await res.json());
    } catch (err) {
      alert(err.message);
    } finally {
      setViewingLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const c = { email: email.trim(), pass: password };
    try {
      const data = await loadRegistrations(c);
      setRegistrations(data);
      setCreds(c);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    if (!creds) return;
    try {
      setRegistrations(await loadRegistrations(creds));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this registration? This can't be undone.")) return;
    setBusyId(id);
    try {
      const res = await fetch(FN_ID(id, creds), { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setRegistrations((rs) => rs.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  function handleEditClick(reg) {
    setEditingId(reg.id);
    setEditForm({ ...reg });
  }

  async function saveFields(id, fields) {
    setBusyId(id);
    try {
      const res = await fetch(FN_ID(id, creds), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error("Save failed");
      const { registration } = await res.json();
      setRegistrations((rs) => rs.map((r) => (r.id === id ? registration : r)));
      return registration;
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveEdit(id) {
    try {
      await saveFields(id, editForm);
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleApprove(id) {
    try {
      const updated = await saveFields(id, { paymentStatus: "approved" });
      setViewingReg(updated);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDownloadQR(reg) {
    try {
      const qrData = `ID: ${reg.id}\nName: ${reg.fullname}\nEmail: ${reg.email}\nRef: ${reg.payref}`;
      const qrCodeUrl = await QRCode.toDataURL(qrData, { width: 400, margin: 2 });
      const link = document.createElement("a");
      link.href = qrCodeUrl;
      link.download = `${reg.id}-QR-Code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert("Failed to generate QR code");
    }
  }

  if (!creds) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--paper, #0C1710)" }}>
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl p-8 space-y-6" style={{ background: "var(--ink, #04100A)", border: "1px solid var(--line, #26382C)" }}>
          <div className="text-center">
            <div className="text-xs font-bold tracking-[.3em]" style={{ color: "var(--green-bright, #17A048)" }}>BAYELSA AI EXPEDITION</div>
            <h1 className="text-2xl font-black mt-2" style={{ color: "#fff" }}>Admin sign in</h1>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted, #9DB0A3)" }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ background: "var(--field, #16241B)", border: "1px solid var(--field-line, #33493A)", color: "#fff" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted, #9DB0A3)" }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ background: "var(--field, #16241B)", border: "1px solid var(--field-line, #33493A)", color: "#fff" }} />
          </div>
          {error && <p className="text-sm font-medium text-center" style={{ color: "var(--red, #D01F2C)" }}>{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-bold" style={{ background: "var(--gold, #F5B324)", color: "#12200F" }}>
            {loading ? "Checking…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8" style={{ background: "var(--paper, #0C1710)", color: "#EAF2EC" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="text-xs font-bold tracking-[.3em]" style={{ color: "var(--green-bright, #17A048)" }}>BAYELSA AI EXPEDITION</div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">Registrations</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={refresh} className="px-4 py-2.5 rounded-lg font-semibold" style={{ background: "var(--soft, #111E16)", border: "1px solid var(--line, #26382C)" }}>Refresh</button>
            <div className="font-bold px-5 py-2.5 rounded-lg" style={{ background: "var(--soft, #111E16)", border: "1px solid var(--line, #26382C)", color: "var(--green-bright, #17A048)" }}>
              {registrations.length} registered
            </div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background: "var(--ink, #04100A)", border: "1px solid var(--line, #26382C)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="text-xs uppercase" style={{ background: "var(--soft, #111E16)", color: "var(--muted, #9DB0A3)" }}>
                  <th className="px-6 py-4">ID & date</th>
                  <th className="px-6 py-4">Participant</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {registrations.length === 0 && (
                  <tr><td className="px-6 py-8 text-center" style={{ color: "var(--muted, #9DB0A3)" }} colSpan={5}>No registrations yet.</td></tr>
                )}
                {registrations.map((reg) => (
                  <tr key={reg.id} style={{ borderTop: "1px solid var(--line, #26382C)" }}>
                    <td className="px-6 py-4 font-bold" style={{ color: "var(--gold, #F5B324)" }}>
                      {reg.id}
                      <div className="text-xs font-normal" style={{ color: "var(--muted, #9DB0A3)" }}>{reg.issuedAt ? new Date(reg.issuedAt).toLocaleDateString() : "—"}</div>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === reg.id ? (
                        <input value={editForm.fullname || ""} onChange={(e) => setEditForm({ ...editForm, fullname: e.target.value })}
                          className="px-2 py-1 rounded w-full" style={{ background: "var(--field, #16241B)", border: "1px solid var(--field-line, #33493A)", color: "#fff" }} />
                      ) : (
                        <>
                          <div className="font-semibold">{reg.fullname}</div>
                          <div className="text-xs" style={{ color: "var(--muted, #9DB0A3)" }}>{reg.occupation || reg.work}</div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === reg.id ? (
                        <input value={editForm.phone || ""} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="px-2 py-1 rounded w-full" style={{ background: "var(--field, #16241B)", border: "1px solid var(--field-line, #33493A)", color: "#fff" }} />
                      ) : (
                        <>
                          <div>{reg.phone}</div>
                          <div className="text-xs" style={{ color: "var(--muted, #9DB0A3)" }}>{reg.email}</div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4"><StatusBadge reg={reg} /></td>
                    <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                      {editingId === reg.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(reg.id)} disabled={busyId === reg.id} className="font-bold" style={{ color: "var(--green-bright, #17A048)" }}>
                            {busyId === reg.id ? "Saving…" : "Save"}
                          </button>
                          <button onClick={() => setEditingId(null)} style={{ color: "var(--muted, #9DB0A3)" }}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleView(reg)} className="font-medium" style={{ color: "#fff" }}>View</button>
                          <button onClick={() => handleDownloadQR(reg)} className="font-medium" style={{ color: "var(--green-bright, #17A048)" }}>QR</button>
                          <button onClick={() => handleEditClick(reg)} className="font-medium" style={{ color: "var(--gold, #F5B324)" }}>Edit</button>
                          <button onClick={() => handleDelete(reg.id)} disabled={busyId === reg.id} className="font-medium" style={{ color: "var(--red, #D01F2C)" }}>
                            {busyId === reg.id ? "…" : "Delete"}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewingReg && (
        <DetailModal
          reg={viewingReg}
          onClose={() => setViewingReg(null)}
          onApprove={handleApprove}
          busy={busyId === viewingReg.id}
          loading={viewingLoading}
        />
      )}
    </div>
  );
}
