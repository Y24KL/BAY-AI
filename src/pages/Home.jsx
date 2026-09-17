import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Facts from "../components/Facts";
import Courses from "../components/Courses";
import HowItWorks from "../components/HowItWorks";
import RegistrationForm from "../components/RegistrationForm";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Facts />
      <Courses />
      <HowItWorks />
      <RegistrationForm />
      <Footer />
    </>
  );
}
