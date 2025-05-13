import { motion } from "framer-motion";

const MediaCard = ({ title, summary, image, source, date, link }) => {
  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="block bg-white rounded-xl shadow hover:shadow-lg transition duration-300"
    >
      <img
        src={image}
        alt={title}
        className="w-full h-48 object-cover rounded-t-xl"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-green-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{summary}</p>
        <div className="text-xs text-gray-500 flex justify-between items-center">
          <span>{source}</span>
          <span>{date}</span>
        </div>
      </div>
    </motion.a>
  );
};

export default MediaCard;
