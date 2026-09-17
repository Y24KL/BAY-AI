import { useState } from "react";

export default function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/.netlify/functions/get-all-registrations?email=${encodeURIComponent(email)}&pass=${encodeURIComponent(password)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Login failed");

      setRegistrations(data);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <form onSubmit={handleLogin} className="p-8 bg-white rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Access</h2>
          
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin Email Address"
            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin Password"
            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
          
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-700 text-white font-bold py-2 px-4 rounded-md hover:bg-green-800 transition-colors"
          >
            {loading ? "Verifying..." : "View Registrations"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50 text-gray-900">
      <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-black text-green-900">Registration Dashboard</h1>
        <div className="bg-green-100 text-green-800 font-bold px-4 py-2 rounded-full">
          Total: {registrations.length} slots filled
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-200">
              <th className="p-4 font-bold text-sm text-gray-600">ID & Date</th>
              <th className="p-4 font-bold text-sm text-gray-600">Participant</th>
              <th className="p-4 font-bold text-sm text-gray-600">Contact</th>
              <th className="p-4 font-bold text-sm text-gray-600">Courses</th>
              <th className="p-4 font-bold text-sm text-gray-600">Payment Ref</th>
              <th className="p-4 font-bold text-sm text-gray-600">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {registrations.map((reg) => (
              <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-green-700">{reg.id}</div>
                  <div className="text-xs text-gray-500">{new Date(reg.issuedAt).toLocaleDateString()}</div>
                </td>
                <td className="p-4">
                  <div className="font-bold">{reg.fullname}</div>
                  <div className="text-sm text-gray-600">{reg.work}</div>
                </td>
                <td className="p-4 text-sm">
                  <div>{reg.phone}</div>
                  <div className="text-gray-500">{reg.email}</div>
                </td>
                <td className="p-4 text-sm">
                  {reg.courses.length === 7 ? "All 7 Courses" : `${reg.courses.length} Courses`}
                  <div className="text-xs text-gray-500 mt-1">{reg.mode}</div>
                </td>
                <td className="p-4">
                  <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">
                    {reg.payref}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{reg.payername}</div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-blue-600 cursor-help" title={reg.receiptName}>
                    {reg.receiptName ? "Uploaded ✓" : "Missing"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
