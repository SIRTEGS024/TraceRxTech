import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import logo from '../assets/TRACE_RX.jpg';

const DashboardNavbar = () => {
  const navigate = useNavigate(); // Initialize navigate function

  const handleLogoClick = () => {
    navigate('/'); // Navigate to home page
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-r from-green-700 to-emerald-600 shadow-lg w-full" // Added w-full
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 sm:py-0 sm:h-16 space-y-3 sm:space-y-0">
          {/* Logo and Platform Name - Now clickable */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center justify-center sm:justify-start space-x-3 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-lg p-1"
            onClick={handleLogoClick}
            aria-label="Go to home page"
          >
            <div className="flex-shrink-0">
              <div>
                <img
                  src={logo}
                  alt="Trace RX Logo"
                  className="h-10" // Doubled the size
                />
              </div>
            </div>
          </motion.button>

          {/* Logged-in Company Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center sm:items-end space-y-1"
          >
            {/* Company Name */}
            <motion.div
              className="text-white font-semibold text-sm sm:text-base text-center sm:text-right"
            >
              American Timber Exports Inc.
            </motion.div>

            {/* Contact Information */}
            <motion.div
              className="flex items-center space-x-2"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="bg-green-800 bg-opacity-50 rounded-full p-1 sm:p-2"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </motion.div>
              <motion.a
                whileHover={{ color: "#d1fae5" }}
                href="mailto:contact@ecocomply.com"
                className="text-green-100 hover:text-emerald-200 font-medium transition-colors duration-200 text-xs sm:text-sm text-center"
              >
                contact@ecocomply.com
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default DashboardNavbar;