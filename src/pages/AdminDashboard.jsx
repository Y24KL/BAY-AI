import { useState } from "react";
import QRCode from "qrcode";

const FN = (params) => `/api/admin/registrations?${new URLSearchParams(params)}`;
const FN_ID = (id, params) => `/api/admin/registrations/${encodeURIComponent(id)}?${new URLSearchParams(params)}`;

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
  const [receiptModal, setReceiptModal] = useState(null); // State for receipt image popup

  async function loadRegistrations(c) {
    const res = await fetch(FN(c));
    if (!res.ok) throw new Error(res.status === 401 ? "Invalid email or password" : "Could not load registrations");
    return res.json();
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

  async function handleApprove(id, reg) {
    if (!window.confirm("Approve this registration? Ensure you have verified the payment receipt.")) return;
    setBusyId(id);
    try {
      const res = await fetch(FN_ID(id, creds), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...reg, status: "Approved" }),
      });
      if (!res.ok) throw new Error("Approval failed");
      const { registration } = await res.json();
      setRegistrations((rs) => rs.map((r) => (r.id === id ? registration : r)));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
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

  async function handleSaveEdit(id) {
    setBusyId(id);
    try {
      const res = await fetch(FN_ID(id, creds), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Save failed");
      const { registration } = await res.json();
      setRegistrations((rs) => rs.map((r) => (r.id === id ? registration : r)));
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDownloadQR(reg) {
    try {
      const qrData = `ID: ${reg.id}\nName: ${reg.fullname}\nEmail: ${reg.email}\nRef: ${reg.payref}\nStatus: ${reg.status || 'Pending'}`;
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
    <div className="min-h-screen p-4 sm:p-8" style={{ background: "var(--paper, #0C1710)", color: "var(--text, #EAF2EC)" }}>
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
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="text-xs uppercase" style={{ background: "var(--soft, #111E16)", color: "var(--muted, #9DB0A3)" }}>
                  <th className="px-6 py-4">ID & date</th>
                  <th className="px-6 py-4">Participant</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Payment & Receipt</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {registrations.length === 0 && (
                  <tr><td className="px-6 py-8 text-center" style={{ color: "var(--muted, #9DB0A3)" }} colSpan={5}>No registrations yet.</td></tr>
                )}
                {registrations.map((reg) => (
                  <tr key={reg.id} style={{ borderTop: "1px solid var(--line, #26382C)" }}>
                    <td className="px-6 py-4 font-bold align-top" style={{ color: "var(--gold, #F5B324)" }}>
                      {reg.id}
                      <div className="text-xs font-normal mt-1" style={{ color: "var(--muted, #9DB0A3)" }}>{reg.issuedAt ? new Date(reg.issuedAt).toLocaleDateString() : "—"}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      {editingId === reg.id ? (
                        <input value={editForm.fullname || ""} onChange={(e) => setEditForm({ ...editForm, fullname: e.target.value })}
                          className="px-2 py-1 rounded w-full" style={{ background: "var(--field, #16241B)", border: "1px solid var(--field-line, #33493A)", color: "#fff" }} />
                      ) : (
                        <>
                          <div className="font-semibold">{reg.fullname}</div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--muted, #9DB0A3)" }}>{reg.occupation || reg.work}</div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top">
                      {editingId === reg.id ? (
                        <input value={editForm.phone || ""} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="px-2 py-1 rounded w-full" style={{ background: "var(--field, #16241B)", border: "1px solid var(--field-line, #33493A)", color: "#fff" }} />
                      ) : (
                        <>
                          <div className="font-medium">{reg.phone}</div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--muted, #9DB0A3)" }}>{reg.email}</div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="mb-2">
                        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider" 
                              style={{ 
                                background: reg.status === 'Approved' ? "rgba(23,160,72,.15)" : "rgba(245,179,36,.15)", 
                                color: reg.status === 'Approved' ? "var(--green-bright, #17A048)" : "var(--gold, #F5B324)" 
                              }}>
                          {reg.status || 'Pending'}
                        </span>
                      </div>
                      <span className="font-mono px-2 py-1 rounded text-xs" style={{ background: "var(--soft, #111E16)" }}>{reg.payref}</span>
                      
                      {/* View Receipt Button */}
                      {(reg.receiptUrl || reg.receipt) && (
                        <button 
                          onClick={() => setReceiptModal(reg.receiptUrl || reg.receipt)}
                          className="block mt-3 text-xs font-bold transition-colors hover:opacity-80 flex items-center gap-1" 
                          style={{ color: "var(--green-bright, #17A048)" }}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Receipt
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right align-top space-x-3 whitespace-nowrap">
                      {editingId === reg.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(reg.id)} disabled={busyId === reg.id} className="font-bold" style={{ color: "var(--green-bright, #17A048)" }}>
                            {busyId === reg.id ? "Saving…" : "Save"}
                          </button>
                          <button onClick={() => setEditingId(null)} style={{ color: "var(--muted, #9DB0A3)" }}>Cancel</button>
                        </>
                      ) : (
                        <>
                          {reg.status !== "Approved" && (
                            <button onClick={() => handleApprove(reg.id, reg)} disabled={busyId === reg.id} className="font-bold" style={{ color: "var(--green-bright, #17A048)" }}>
                              {busyId === reg.id ? "…" : "Approve"}
                            </button>
                          )}
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

      {/* Receipt Viewer Modal matching the dark theme */}
      {receiptModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4" 
          style={{ background: "rgba(4,16,10,.86)", backdropFilter: "blur(4px)" }}
          onClick={() => setReceiptModal(null)}
        >
          <div 
            className="relative max-w-2xl w-full rounded-xl overflow-hidden shadow-2xl flex flex-col" 
            style={{ background: "var(--paper, #0C1710)", border: "1px solid var(--line, #26382C)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 flex justify-between items-center" style={{ background: "var(--ink, #04100A)", borderBottom: "1px solid var(--line, #26382C)" }}>
              <h3 className="font-bold" style={{ color: "#fff" }}>Payment Receipt</h3>
              <button onClick={() => setReceiptModal(null)} className="text-xl font-bold hover:opacity-70 transition-opacity" style={{ color: "var(--muted, #9DB0A3)" }}>
                ✕
              </button>
            </div>
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[75vh]" style={{ background: "var(--soft, #111E16)" }}>
              <img 
                src={receiptModal} 
                alt="Payment Receipt" 
                className="max-w-full h-auto object-contain rounded border" 
                style={{ borderColor: "var(--line, #26382C)" }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
                          }
