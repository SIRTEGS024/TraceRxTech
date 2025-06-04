import { motion } from "framer-motion";
import ExecutiveCard from "../components/ExecutiveCard";
import StatCounter from "../components/StatCounter";
import { EXECUTIVES, GALLERY_IMAGES, MISSION_VISSION } from "../constants";

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
          About TraceRxTech
        </motion.h1>
        <motion.p variants={item} className="text-lg text-gray-600 max-w-3xl mx-auto">
          Empowering agricultural growth through technology and innovation.
        </motion.p>
      </motion.section>

      {/* Stats */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="px-4 mb-20 max-w-6xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <motion.div variants={item}>
            <StatCounter end={150} label="Clients" />
          </motion.div>
          <motion.div variants={item}>
            <StatCounter end={2000} label="Farmers Empowered" />
          </motion.div>
          <motion.div variants={item}>
            <StatCounter end={75} label="Employees" />
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
        // variants={container}
        // initial="hidden"
        // whileInView="show"
        // viewport={{ once: true, amount: 0.3 }}
        className="py-20 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2
            variants={item}
            className="text-3xl text-green-800 font-bold mb-10 text-center"
          >
            Traceability, Sustainability, Legality and Due diligence.
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {GALLERY_IMAGES.map(({ id, imageUrl, alt }) => (
              <motion.img
                key={`gallery-${id}`}
                variants={item}
                src={imageUrl}
                loading="lazy"
                alt={alt}
                className="w-full h-40 sm:h-48 md:h-56 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Executives */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="bg-white py-20 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2
            variants={item}
            className="text-3xl text-green-800 font-bold mb-12 text-center"
          >
            Meet Our Executives
          </motion.h2>
          <div
            className={`grid gap-8 ${EXECUTIVES.length === 2
              ? "grid-cols-1 sm:grid-cols-2 justify-center"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
              }`}
          >
            {EXECUTIVES.map((exec) => (
              <motion.div
                key={exec.id}
                variants={item}
                className="transition-transform duration-300 transform hover:scale-105 hover:shadow-lg rounded-xl bg-green-50 p-6 min-h-[400px] max-w-sm mx-auto w-full"
              >
                <ExecutiveCard {...exec} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </main>
  );
};

export default AboutUs;
