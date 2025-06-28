import { motion } from "framer-motion";

const SystemCard = ({ image, title, subtext, buttonText }) => {
  return (
    <motion.div
      className="relative bg-white shadow-lg rounded-2xl overflow-hidden w-56 h-80 lg:w-64 lg:h-96 flex-shrink-0"
      whileHover={{
        x: 10,
        scale: 1.03,
        boxShadow: "0 10px 30px rgba(0, 128, 0, 0.4)",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ transformOrigin: "center" }}
    >
      {/* Background image with green transparent overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="absolute inset-0 bg-green-600 opacity-50"></div>
      </div>
      {/* Content on top of the image */}
      <div className="relative z-10 flex flex-col h-full justify-between p-4 text-center">
        <div className="flex flex-col flex-grow">
          <h3 className="text-white text-lg font-extrabold mb-2">{title}</h3>
          <p className="text-white text-sm font-bold mb-4">{subtext}</p>
        </div>
        <button className="border border-white text-white bg-transparent px-4 py-2 rounded-full transition-all duration-300 hover:bg-white hover:text-green-600">
          {buttonText}
        </button>
      </div>
    </motion.div>
  );
};

export default SystemCard;