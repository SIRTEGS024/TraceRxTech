// RegulationsBadge.jsx - Alternative Simple Version
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Scale } from 'lucide-react';

const RegulationsBadge = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div className="fixed z-40" style={{
      bottom: isMobile ? '0.3rem' : '0.5rem', // Push down a bit more
      right: isMobile ? '0rem' : '2rem'    // Adjust right position too
    }}>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => !isMobile && setIsHovered(true)}
        onTouchEnd={() => !isMobile && setIsHovered(false)}
      >
        {/* Mobile: Just icon, Desktop: Smaller full badge */}
        <div className={`flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
          isMobile 
            ? 'p-3' // Mobile size unchanged
            : 'px-3 py-2 text-sm' // Reduced padding and smaller text for desktop
        }`}>
          {/* Icon - larger on mobile, smaller on desktop */}
          <Scale size={isMobile ? 24 : 18} />
          
          {/* Text - only show on desktop, with smaller font */}
          {!isMobile && (
            <>
              <span className="font-semibold whitespace-nowrap">EUDR Regulations</span>
              <BookOpen size={16} />
            </>
          )}
        </div>

        {/* Pulse Animation - smaller for desktop */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-green-500 rounded-full blur-sm -z-10"
          style={{
            transform: isMobile ? 'scale(1)' : 'scale(0.9)' // Slightly smaller pulse on desktop
          }}
        />
      </motion.button>

      {/* Tooltip - Only on desktop, adjusted for smaller badge */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10
          }}
          className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-sm p-3 rounded-lg shadow-lg pointer-events-none"
        >
          <p>Click to view EUDR regulations and compliance requirements for imports/exports</p>
          <div className="absolute top-full right-4 -mt-1 border-8 border-transparent border-t-gray-900"></div>
        </motion.div>
      )}

      {/* Mobile tap indicator (briefly shows on tap) */}
      {isMobile && isHovered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full"
        >
          Tap
        </motion.div>
      )}
    </div>
  );
};

export default RegulationsBadge;