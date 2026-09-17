import { useState } from "react";
import QRCode from "qrcode";

export default function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Mock initial data matching your exact registration form structure
  const [registrations, setRegistrations] = useState([
    {
      id: "BAY-001",
      issuedAt: new Date().toISOString(),
      fullname: "Sample User",
      work: "Developer",
      phone: "+2348000000000",
      email: "user@example.com",
      courses: ["AI Basics", "Web Dev"],
      mode: "Online",
      payref: "REF12345678",
      payername: "Sample User"
    }
  ]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (email.trim() === "opujoedou@gmail.com" && password === "admin2026") {
        setIsAuthenticated(true);
      } else {
        setError("Invalid email or password");
      }
      setLoading(false);
    }, 500);
  };

  // Delete participant
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this registration?")) {
      setRegistrations(registrations.filter((reg) => reg.id !== id));
    }
  };

  // Start editing
  const handleEditClick = (reg) => {
    setEditingId(reg.id);
    setEditForm({ ...reg });
  };

  // Save edit
  const handleSaveEdit = (id) => {
    setRegistrations(registrations.map((reg) => (reg.id === id ? editForm : reg)));
    setEditingId(null);
  };

  // Download unique QR code
  const handleDownloadQR = async (reg) => {
    try {
      const qrData = `ID: ${reg.id}\nName: ${reg.fullname}\nEmail: ${reg.email}\nRef: ${reg.payref}`;
      const qrCodeUrl = await QRCode.toDataURL(qrData, { width: 400, margin: 2 });
      
      const link = document.createElement("a");
      link.href = qrCodeUrl;
      link.download = `${reg.id}-QR-Code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to generate QR code");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Admin Access</h2>
            <p className="mt-2 text-sm text-gray-500">Secure portal for Bay AI registrations</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600 font-medium text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-lg text-white bg-gray-900 hover:bg-green-600 transition-colors font-bold">
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Registration Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Manage, edit, and download participant credentials</p>
          </div>
          <div className="bg-white border border-gray-200 text-green-700 font-bold px-5 py-2.5 rounded-lg shadow-sm">
            {registrations.length} slots filled
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-600 uppercase">
                  <th className="px-6 py-4">ID & Date</th>
                  <th className="px-6 py-4">Participant</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Payment Ref</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold">
                      {reg.id}
                      <div className="text-xs text-gray-400 font-normal">{new Date(reg.issuedAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === reg.id ? (
                        <input
                          type="text"
                          value={editForm.fullname}
                          onChange={(e) => setEditForm({ ...editForm, fullname: e.target.value })}
                          className="border px-2 py-1 rounded w-full"
                        />
                      ) : (
                        <>
                          <div className="font-semibold">{reg.fullname}</div>
                          <div className="text-xs text-gray-500">{reg.work}</div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === reg.id ? (
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="border px-2 py-1 rounded w-full"
                        />
                      ) : (
                        <>
                          <div>{reg.phone}</div>
                          <div className="text-xs text-gray-500">{reg.email}</div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{reg.payref}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {editingId === reg.id ? (
                        <button onClick={() => handleSaveEdit(reg.id)} className="text-green-600 font-bold hover:underline">Save</button>
                      ) : (
                        <>
                          <button onClick={() => handleDownloadQR(reg)} className="text-blue-600 font-medium hover:underline">QR</button>
                          <button onClick={() => handleEditClick(reg)} className="text-amber-600 font-medium hover:underline">Edit</button>
                          <button onClick={() => handleDelete(reg.id)} className="text-red-600 font-medium hover:underline">Delete</button>
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
    </div>
  );
}
