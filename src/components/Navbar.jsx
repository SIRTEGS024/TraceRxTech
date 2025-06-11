// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
} from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import logo from "../assets/TRACE_RX.jpg";
import { NAV_LINKS } from "../constants";
import ReusableInput from "./ReusableInput";

export default function Navbar() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const closeDropdowns = () => {
      setOpenDropdown(null);
      setMobileOpenDropdown(null);
    };
    document.addEventListener("click", closeDropdowns);
    return () => document.removeEventListener("click", closeDropdowns);
  }, []);

  const handleMobileLinkClick = () => {
    setMobileOpenDropdown(null);
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/partners?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  return (
    <div className="w-full fixed left-0 bg-white shadow z-50">
      <div className="w-[84vw] mx-auto p-2">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-10" />
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MdPhone size={18} />
              <a href="tel:+919972524322" className="text-gray-700 font-medium">
                07012507260
              </a>
            </div>
            <a href="mailto:contact@example.com">
              <MdEmail size={18} className="text-gray-700" />
            </a>
            <form onSubmit={handleSearch} className="max-w-xs">
              <ReusableInput
                placeholder="Track By Container/BL No."
                icon={FaSearch}
                variant="black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        <div className="h-px w-full mt-2 bg-emerald-200" />

        <form onSubmit={handleSearch} className="md:hidden my-4">
          <ReusableInput
            placeholder="Track By Container/BL No."
            icon={FaSearch}
            variant="black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div
          className={`w-full flex-col md:flex md:flex-row justify-between items-center p-1 ${menuOpen ? "flex" : "hidden"
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
                    {/* Desktop submenu */}
                    <div className="hidden md:block">
                      <div
                        className="relative pb-1 group"
                        onMouseEnter={() => setOpenDropdown(link.name)}
                      >
                        <button
                          className="flex items-center text-gray-700 text-sm font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(
                              openDropdown === link.name ? null : link.name
                            );
                          }}
                        >
                          {link.name}
                          <FaChevronDown className="ml-1 text-xs" />
                          <div className="absolute left-0 bottom-0 w-full h-[2px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                        </button>
                      </div>
                      <div
                        className={`absolute left-0 top-full bg-white text-black shadow-lg w-[400px] grid grid-cols-2 gap-2 p-2 transition-all duration-200 z-50 ${openDropdown === link.name ? "block" : "hidden"
                          } max-h-80 overflow-y-auto rounded-md`}
                      >
                        {link.subLinks.map((s, index) => (
                          <div key={s.name} className="w-full">
                            <Link
                              to={s.url}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-600 hover:text-white rounded-md transition-colors"
                            >
                              {s.name}
                            </Link>
                            {index !== link.subLinks.length - 1 && (
                              <hr className="border-t border-gray-200 my-1" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mobile submenu */}
                    <div className="md:hidden">
                      <button
                        className="flex items-center justify-between w-full text-gray-700 text-sm font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMobileOpenDropdown(
                            mobileOpenDropdown === link.name ? null : link.name
                          );
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
                        className={`pl-4 overflow-hidden transition-all duration-300 ease-in-out bg-white ${mobileOpenDropdown === link.name
                          ? "max-h-96"
                          : "max-h-0"
                          }`}
                      >
                        {link.subLinks.map((s) => (
                          <Link
                            key={s.name}
                            to={s.url}
                            onClick={handleMobileLinkClick}
                            className="block py-3 px-4 text-gray-700 hover:bg-gray-100 text-sm font-medium"
                          >
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    to={link.url}
                    onClick={handleMobileLinkClick}
                    className="text-gray-700 text-sm font-medium pb-1 relative group"
                  >
                    {link.name}
                    <div className="absolute left-0 bottom-0 w-full h-[2px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                  </Link>
                )}
              </div>
            ))}
            
            {/* Added Need Help? link */}
            <Link
              to="#"
              onClick={handleMobileLinkClick}
              className="text-gray-700 text-sm font-medium pb-1 relative group"
            >
              Need Help?
              <div className="absolute left-0 bottom-0 w-full h-[2px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </Link>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link
              to="/partners"
              onClick={handleMobileLinkClick}
              className="flex items-center text-emerald-700 font-semibold text-sm md:text-base px-3 py-1 rounded-md transition-colors duration-200 hover:bg-emerald-100"
            >
              <MdLocationOn className="mr-1" size={20} />
              Tracking
            </Link>
            
            {/* Added BOOK DEMO button */}
            <Link
              to="#"
              className="bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700 w-full md:w-auto text-center"
            >
              BOOK DEMO
            </Link>

            <Link
              to="/login"
              onClick={handleMobileLinkClick}
              className="bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700 w-full md:w-auto text-center"
            >
              SIGN IN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}