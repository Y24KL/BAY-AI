import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import AdminDashboard from "./pages/AdminDashboard"; // <-- Import the new admin page
import { useLenis } from "./lib/lenis";
import "./styles/global.css";

export default function App() {
  useLenis();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/registration/:id" element={<RegistrationSuccess />} />
      
      {/* Add the admin route here */}
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}
