import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import { useLenis } from "./lib/lenis";
import "./styles/global.css";

export default function App() {
  useLenis();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/registration/:id" element={<RegistrationSuccess />} />
    </Routes>
  );
}
