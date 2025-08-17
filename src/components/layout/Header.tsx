import React, { useState } from "react";
import logo from "../../assets/logo.png";

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // IDs for anchor navigation
  const NAV_SECTIONS = [
    { id: "features", label: "Fonctionnalités" },
    { id: "value", label: "Pourquoi CvMentor AI ?" },
    { id: "about", label: "À propos" },
    { id: "faq", label: "FAQ" },
    { id: "", label: "Commencer" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[75px]">
        {/* Logo + slogan */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="CvMentor AI Logo" className="w-12 h-11" />
          <div>
            <span
              className="font-bold text-xl sm:text-xl text-[#15679d]"
              translate="no"
            >
              <span className="text-[#f1701c]">C</span>
              <span className="text-[#15679d]">v</span>
              <span className="text-[#f1701c]">Mentor</span>
              <span className="text-[#15679d]"> AI</span>
            </span>{" "}
            <p className="text-xs text-gray-600 font-semibold">
              Optimisez votre candidature
            </p>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-2 items-center">
          {NAV_SECTIONS.slice(0, -1).map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="text-gray-700 hover:text-[#f1701c] font-medium px-2 py-1 rounded transition-colors duration-150 text-sm"
            >
              {section.label}
            </a>
          ))}
          {/* Distinct orange button for 'Commencer' */}
          <a
            key={NAV_SECTIONS[NAV_SECTIONS.length - 1].id}
            href={`#${NAV_SECTIONS[NAV_SECTIONS.length - 1].id}`}
            className="ml-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow transition-colors duration-150"
          >
            {NAV_SECTIONS[NAV_SECTIONS.length - 1].label}
          </a>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            aria-label="Ouvrir le menu"
            className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#f1701c]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-orange-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8h16M4 16h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute left-0 w-full bg-white/95 shadow-lg border-b border-gray-100 animate-fade-in z-50">
          <div className="flex flex-col py-2 px-4 gap-2">
            {NAV_SECTIONS.slice(0, -1).map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-gray-800 hover:text-[#f1701c] font-semibold px-2 py-3 rounded transition-colors duration-150 text-base border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {section.label}
              </a>
            ))}
            {/* Distinct orange button for 'Commencer' */}
            {/* <a
              key={NAV_SECTIONS[NAV_SECTIONS.length - 1].id}
              href={`#${NAV_SECTIONS[NAV_SECTIONS.length - 1].id}`}
              className="mt-2 px-4 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-base shadow transition-colors duration-150 text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              {NAV_SECTIONS[NAV_SECTIONS.length - 1].label}
            </a> */}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
