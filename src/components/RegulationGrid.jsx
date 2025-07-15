import { motion } from "framer-motion";

export const RegulationGrid = ({ regulationsData }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Grid of regulation logos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-16 justify-center">
        {regulationsData.map((reg) => (
          <motion.a
            key={reg.id}
            href={reg.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
              <img
                src={reg.coverImage}
                alt={reg.title}
                className="w-48 h-48 sm:w-80 sm:h-80 object-contain"
              />
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};