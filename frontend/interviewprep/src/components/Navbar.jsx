"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
   <nav
  className="fixed top-0 left-0 w-full z-50 bg-white shadow-md py-4 transition-all duration-300"
>
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6">

        {/* LOGO */}
   <h1
  className={`
    text-2xl font-bold transition-all duration-300 
    ${!scrolled 
      ? "text-purple-700" 
      : "bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent"
    }
  `}
>
  InterviewAI
</h1>
        {/* DESKTOP NAV */}
        <div className="hidden md:flex space-x-10 font-medium text-gray-700">
         

  <a href="#home" className="hover:text-purple-600">Home</a>
          <a href="#reports" className="hover:text-purple-600">View Reports</a>
          <a href="#about-us" className="hover:text-purple-600">About Us</a>
          <a href="#contact" className="hover:text-purple-600">Contact Us</a> 

        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setOpenMenu(!openMenu)}
        >
          {openMenu ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {openMenu && (
        <div className="md:hidden bg-white shadow-md rounded-b-xl px-6 py-4 space-y-4 text-gray-700 font-medium">
          <a href="#home" onClick={() => setOpenMenu(false)} className="block">Home</a>
          <a href="#reports" onClick={() => setOpenMenu(false)} className="block">View Reports</a>
          <a href="#about" onClick={() => setOpenMenu(false)} className="block">About Us</a>
          <a href="#contact" onClick={() => setOpenMenu(false)} className="block">Contact Us</a>
        </div>
      )}
    </nav>
  );
}
