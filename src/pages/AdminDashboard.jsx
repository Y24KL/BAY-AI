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

    // Simulate slight network delay for effect
    setTimeout(() => {
      // Direct frontend check matching your credentials
      if (email.trim() === "opujoedou@gmail.com" && password === "admin2026") {
        setIsAuthenticated(true);
        // Mock or fetch your registration list here
        setRegistrations([
          {
            id: "BAY-001",
            issuedAt: new Date().toISOString(),
            fullname: "Sample User",
            work: "Developer",
            phone: "+2348000000000",
            email: "user@example.com",
            courses: ["AI Basics"],
            mode: "Online",
            payref: "REF12345678",
            payername: "Sample User"
          }
        ]);
      } else {
        setError("Invalid email or password");
      }
      setLoading(false);
    }, 600);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Admin Access</h2>
            <p className="mt-2 text-sm text-gray-500">Secure portal for Bay AI registrations</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 font-medium text-center">{error}</p>
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-70"
            >
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
            <p className="text-gray-500 text-sm mt-1">Manage and verify participant entries</p>
          </div>
          <div className="bg-white border border-gray-200 text-green-700 font-bold px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            {registrations.length} slots filled
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">ID & Date</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">Participant</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">Contact</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">Courses</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">Payment Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{reg.id}</div>
                      <div className="text-xs text-gray-500 font-medium mt-1">{new Date(reg.issuedAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{reg.fullname}</div>
                      <div className="text-sm text-gray-500 mt-1 truncate max-w-[200px]">{reg.work || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{reg.phone}</div>
                      <div className="text-sm text-gray-500 mt-1">{reg.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {Array.isArray(reg.courses) ? (reg.courses.length === 7 ? "All 7 Courses" : `${reg.courses.length} Courses`) : reg.courses}
                      </span>
                      <div className="text-xs text-gray-500 mt-2 font-medium capitalize">{reg.mode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded inline-block">
                        {reg.payref}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">{reg.payername}</div>
                    </td>
                  </tr>
                ))}
                {registrations.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                      No registrations found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
