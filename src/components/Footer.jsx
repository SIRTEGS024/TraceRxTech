import { FaLinkedin, FaFacebookF, FaTwitter, FaLeaf } from "react-icons/fa";
import { FOOTER_LINKS } from "../constants";
import { AUDIT_LOGOS } from "../constants";
import logo from "../assets/TRACE_RX.jpg";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-emerald-800 text-white">
      <div className="max-w-7xl mx-auto p-8 md:p-12">
        {/* Top section with links */}
        <div className="flex flex-col md:flex-row pb-8 md:pb-12">
          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-8 w-full">
            {FOOTER_LINKS.map((column, index) => (
              <div key={index} className="space-y-4">
                <h3 className="font-bold text-lg">{column.heading}</h3>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        to={link.url}
                        className="underline hover:opacity-80 text-white/90 hover:text-white"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Full-width divider */}
        <div className="w-full h-px bg-white/30 mb-8 md:mb-12"></div>

        {/* Bottom section divided by vertical line */}
        <div className="flex flex-col lg:flex-row pt-0 gap-8 lg:gap-12">
          {/* Left side - Brand info */}
          <div className="flex-1 space-y-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl text-white/90">
                <FaLeaf />
              </div>
              <p className="text-sm max-w-xs text-white/80">
                Traceability, Sustainability, Legality and Due diligence.
              </p>
            </div>

            {/* Brand logos with background */}
            <div className="bg-white/10 p-4 rounded-lg w-fit">
              <div className="flex gap-6 items-center">
                {AUDIT_LOGOS.map((logo, index) => (
                  <img
                    key={index}
                    src={logo.src}
                    alt={logo.alt}
                    className="h-12 object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                ))}
              </div>
            </div>

            {/* Address */}
            <p className="text-sm text-white/70">
             56 Captain Davies Road, Ayobo. Lagos Nigeria
            </p>

            {/* Social and privacy */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex gap-3 text-xl">
                <a href="#" className="text-white/80 hover:text-emerald-300">
                  <FaLinkedin />
                </a>
                <a href="#" className="text-white/80 hover:text-emerald-300">
                  <FaFacebookF />
                </a>
                <a href="#" className="text-white/80 hover:text-emerald-300">
                  <FaTwitter />
                </a>
              </div>
              <Link
                to="/privacy-policy"
                className="underline text-sm text-white/80 hover:text-emerald-300"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block w-px bg-white/30 my-4 mx-4"></div>

          {/* Right side - Logo display */}
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white/10 p-6 rounded-xl flex items-center justify-center">
              <img
                src={logo}
                alt="TraceRx Logo"
                className="h-20 object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 py-4">
        <p className="text-emerald-100 text-xs text-center">
          Copyright © 2025 TraceRx Ltd
        </p>
      </div>
    </footer>
  );
};

export default Footer;