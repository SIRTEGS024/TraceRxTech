import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { FaBars, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { MdEmail, MdPhone } from "react-icons/md";
import logo from "../assets/TRACE_RX.jpg";
import TopNavbar from "./TopNavbar";
import { NAV_LINKS } from "../constants";

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState(null);

  useEffect(() => {
    const closeDropdowns = () => {
      setOpenDropdown(null);
      setMobileOpenDropdown(null);
    };
    document.addEventListener("click", closeDropdowns);
    return () => document.removeEventListener("click", closeDropdowns);
  }, []);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const toggleMobileDropdown = (menu) => {
    setMobileOpenDropdown(mobileOpenDropdown === menu ? null : menu);
  };

  return (
    <div
      className={`w-full relative z-50 min-h-[150px] ${isHome ? "pt-14" : ""}`}
    >
      {isHome && <TopNavbar />}
      <div className="w-[84vw] mx-auto p-2 relative">
        <div className="flex justify-between items-center">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-16" />
          </Link>
          <div className="hidden md:flex gap-2 items-center">
            <div>
              Contact:{" "}
              <a href="tel:+919972524322" className="underline">
                +91 99725 24322
              </a>
            </div>
            <div className="h-5 w-0.5 bg-black" />
            <a href="mailto:contact@example.com">
              <MdEmail size={18} className="text-black" />
            </a>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        <div className="h-px w-full mt-4 bg-emerald-200" />

        <div
          className={`w-full flex-col md:flex md:flex-row justify-between items-center p-4 ${
            menuOpen ? "flex" : "hidden"
          } md:flex`}
        >
          {menuOpen && (
            <div className="md:hidden flex items-center gap-2 mb-4 w-full">
              <MdPhone size={18} />
              <a href="tel:+919972524322" className="text-gray-700 font-medium">
                +91 99725 24322
              </a>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto">
            {NAV_LINKS.map((link) => (
              <div
                key={link.name}
                className="relative group w-full md:w-auto"
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {link.subLinks.length > 0 ? (
                  <>
                    {/* Desktop Version */}
                    <div className="hidden md:block">
                      <div
                        className="relative pb-1 group"
                        onMouseEnter={() => setOpenDropdown(link.name)}
                      >
                        <button
                          className="flex items-center text-gray-700 text-sm font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(link.name);
                          }}
                        >
                          {link.name}
                          <FaChevronDown className="ml-1 text-xs" />
                          <div className="absolute left-0 bottom-0 w-full h-[2px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                        </button>
                      </div>

                      {/* Dropdown */}
                      <div
                        className={`absolute left-0 top-full bg-white text-black shadow-lg p-0 space-y-0 w-56 transition-all duration-200 ${
                          openDropdown === link.name ? "block" : "hidden"
                        } z-50`}
                      >
                        {link.subLinks.map((subLink) => (
                          <Link
                            key={subLink.name}
                            to={subLink.url}
                            className="block px-5 py-3 text-gray-700 hover:bg-black hover:text-white text-sm font-medium transition-colors duration-200 w-full"
                          >
                            {subLink.name}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Version */}
                    <div className="md:hidden relative">
                      <button
                        className="flex items-center justify-between w-full text-gray-700 text-sm font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMobileDropdown(link.name);
                        }}
                      >
                        <span>{link.name}</span>
                        {mobileOpenDropdown === link.name ? (
                          <FaChevronUp className="ml-1 text-xs" />
                        ) : (
                          <FaChevronDown className="ml-1 text-xs" />
                        )}
                      </button>

                      <div
                        className={`pl-4 overflow-hidden transition-all duration-300 ease-in-out bg-white ${
                          mobileOpenDropdown === link.name
                            ? "max-h-96"
                            : "max-h-0"
                        }`}
                      >
                        {link.subLinks.map((subLink) => (
                          <Link
                            key={subLink.name}
                            to={subLink.url}
                            className="block py-3 px-4 text-gray-700 hover:bg-gray-100 text-sm font-medium"
                          >
                            {subLink.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="relative group pb-1">
                    <Link
                      to={link.url}
                      className="text-gray-700 text-sm font-medium w-full text-left md:w-auto"
                    >
                      {link.name}
                      <div className="absolute left-0 bottom-0 w-full h-[2px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700 mt-4 md:mt-0 w-full md:w-auto transition-colors duration-200">
            Request Demo
          </button>
        </div>
      </div>
    </div>
  );
}
