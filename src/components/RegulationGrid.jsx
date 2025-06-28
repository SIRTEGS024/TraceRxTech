import { motion } from "framer-motion";

export const RegulationGrid = ({ regulationsData }) => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Grid of regulation cover images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {regulationsData.map((reg) => (
          <motion.div
            key={reg.id}
            className="cursor-pointer flex flex-col items-center"
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            // No onClick handler since no download or modal action is needed
          >
            <img
              src={reg.coverImage}
              alt={reg.title}
              className="w-full max-h-96 object-contain rounded-lg shadow-md"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};