import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom"; // <-- React Router hook

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (sectionId) => {
    setOpenMenu(false);

    if (window.location.pathname !== "/") {
      navigate("/"); // go to home page first
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md py-4 transition-all duration-300">
  <div className="max-w-6xl mx-auto flex items-center px-6">
    {/* Hamburger for mobile (left side) */}
    <div className="md:hidden mr-4">
      <button
        className="text-gray-700"
        onClick={() => setOpenMenu(!openMenu)}
      >
        {openMenu ? <X size={26} /> : <Menu size={26} />}
      </button>
    </div>

    {/* Logo */}
    <h1
      className={`text-2xl font-bold transition-all duration-300 ${
        !scrolled
          ? "text-purple-700"
          : "bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent"
      }`}
    >
      InterviewPrepAI
    </h1>

    {/* Menu Buttons (Desktop) */}
    <div className="hidden md:flex ml-10 space-x-6 font-medium text-gray-700">
      <button onClick={() => handleNavClick("home")} className="hover:text-purple-600">Home</button>
      <button onClick={() => handleNavClick("reports")} className="hover:text-purple-600">View Reports</button>
      <button onClick={() => handleNavClick("about-us")} className="hover:text-purple-600">About Us</button>
      <button onClick={() => handleNavClick("contact")} className="hover:text-purple-600">Contact Us</button>
    </div>
  </div>

  {/* Mobile Menu */}
  {openMenu && (
    <div className="md:hidden bg-white shadow-md rounded-b-xl px-6 py-4 space-y-4 text-gray-700 font-medium">
      <button onClick={() => handleNavClick("home")} className="block">Home</button>
      <button onClick={() => handleNavClick("reports")} className="block">View Reports</button>
      <button onClick={() => handleNavClick("about-us")} className="block">About Us</button>
      <button onClick={() => handleNavClick("contact")} className="block">Contact Us</button>
    </div>
  )}
</nav>


  );
}
