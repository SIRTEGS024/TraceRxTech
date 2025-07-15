import { motion } from "framer-motion";
import { FaLeaf } from "react-icons/fa";
import StatCounter from "../components/StatCounter";
import { GALLERY_IMAGES, MISSION_VISSION } from "../constants";

// Animation variants
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const AboutUs = () => {
  return (
    <main className="flex-grow pt-20 pb-16 bg-gray-50">
      {/* Intro */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="text-center px-4 mb-16"
      >
        <motion.h1 variants={item} className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
          About TraceRX
        </motion.h1>
        <motion.div variants={item} className="flex justify-center items-center gap-2 text-base text-gray-600">
          <FaLeaf size={16} className="text-emerald-600" />
          <span>Traceability, Sustainability, Legality, Due Diligence</span>
        </motion.div>
      </motion.section>

      {/* Stats */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="px-4 mb-20 max-w-6xl mx-auto"
      >
        <div className="grid grid-cols-1 gap-10">
          <motion.div variants={item}>
            <StatCounter end={654900} label="Trees Planted" prefix="+" suffix="+" />
          </motion.div>
        </div>
      </motion.section>

      {/* Problem, Mission, Vision */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="bg-white py-20 px-4"
      >
        <div className="max-w-5xl mx-auto space-y-12">
          {MISSION_VISSION.map(({ title, text }) => (
            <motion.div
              key={title}
              variants={item}
              className="bg-green-50 p-6 rounded-xl shadow-md"
            >
              <h2 className="text-3xl text-green-800 font-bold mb-4">{title}</h2>
              <p className="text-gray-700 text-lg leading-relaxed">{text}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Gallery */}
      <section
        className="py-20 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2
            variants={item}
            className="text-3xl text-green-800 font-bold mb-10 text-center"
          >
            Traceability, Sustainability, Legality and Due Diligence.
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {GALLERY_IMAGES.map(({ id, imageUrl, alt }) => (
              <motion.img
                key={`gallery-${id}`}
                variants={item}
                src={imageUrl}
                loading="lazy"
                alt={alt || "Gallery image"}
                className="w-full h-40 sm:h-48 md:h-56 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;