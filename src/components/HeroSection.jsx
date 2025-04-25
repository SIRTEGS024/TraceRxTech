import { FiCheck, FiArrowRight } from "react-icons/fi";
import TitleSubtext from "./TitleSubtext";
import { motion } from "framer-motion";

// Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay },
  }),
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay },
  }),
};

export default function HeroSection({
  heading,
  subheading,
  checklist = [],
  primaryButton,
  secondaryButton,
  image,
  size,
  color,
}) {
  return (
    <div className="w-full bg-emerald-700 flex flex-col items-center text-white px-4 relative overflow-visible">
      {/* Text Content */}
      <div className="flex flex-col items-center text-center z-10 w-full max-w-7xl mx-auto pt-24">
        {/* Heading + Subheading */}
        {heading && subheading && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
          >
            <TitleSubtext
              title={heading}
              subTitle={subheading}
              size={size}
              color={color}
              underline="none"
            />
          </motion.div>
        )}

        {/* Checklist */}
        {checklist.length > 0 && (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3 mb-10 w-full"
          >
            <div className="mx-auto w-fit flex flex-col items-start">
              {checklist.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-3 w-full"
                >
                  <div className="bg-white rounded-full p-1 flex items-center justify-center mt-1">
                    <FiCheck className="text-emerald-600 text-base" />
                  </div>
                  <p className="text-base">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {primaryButton && (
            <motion.button
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              custom={0.6}
              className="bg-black text-white px-6 py-3 rounded-md font-bold hover:bg-gray-900 transition-colors duration-200 flex items-center justify-center gap-2 text-sm w-full sm:w-auto sm:min-w-[200px]"
            >
              {primaryButton.text}
              <FiArrowRight className="text-white" />
            </motion.button>
          )}

          {secondaryButton && (
            <motion.button
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              custom={0.8}
              className="bg-white text-black px-6 py-3 rounded-md font-bold hover:bg-gray-100 transition-colors duration-200 text-sm w-full sm:w-auto"
            >
              {secondaryButton.text}
            </motion.button>
          )}
        </div>
      </div>

      {/* Hero Image */}
      {image && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="w-full relative z-20 overflow-visible"
        >
          <img
            src={image.src}
            alt={image.alt}
            className="mx-auto w-[90vw] max-w-[1038px] h-auto object-contain object-bottom translate-y-20 sm:translate-y-24 md:translate-y-28"
          />
        </motion.div>
      )}
    </div>
  );
}
