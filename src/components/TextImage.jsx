import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

// Text sizes
const titleSizeMap = {
  large: "text-2xl md:text-3xl lg:text-4xl",
  medium: "text-xl md:text-2xl lg:text-3xl",
  small: "text-base md:text-lg lg:text-xl",
};

const subTitleSizeMap = {
  large: "text-sm md:text-base lg:text-lg",
  medium: "text-xs md:text-sm lg:text-base",
  small: "text-[11px] md:text-xs lg:text-sm",
};

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay },
  }),
};

const TextImage = ({
  heading,
  description,
  buttonText,
  image,
  light = false,
  size = "medium",
}) => {
  const bgColor = light ? "bg-green-700" : "bg-[#1F3A34]";
  const buttonColor = light ? "bg-black" : "bg-green-600";

  const titleSize = titleSizeMap[size] || titleSizeMap.medium;
  const subtitleSize = subTitleSizeMap[size] || subTitleSizeMap.medium;

  return (
    <div className={`${bgColor} text-white py-16 px-6 md:px-12`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:justify-center gap-12">
        {/* Text Group */}
        <div className="flex-1 text-center md:text-left">
          {heading && (
            <motion.h2
              className={`${titleSize} font-semibold mb-3`}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.1}
            >
              {heading}
            </motion.h2>
          )}
          {description && (
            <motion.p
              className={`${subtitleSize} mb-5 text-white/90`}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.3}
            >
              {description}
            </motion.p>
          )}
          {buttonText && (
            <motion.button
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.5}
              className={`${buttonColor} text-white text-sm sm:text-base font-medium px-7 py-3 rounded shadow hover:bg-opacity-90 transition inline-flex items-center gap-2`}
            >
              {buttonText}
              <FiArrowRight className="text-lg" />
            </motion.button>
          )}
        </div>

        {/* Image */}
        {image && (
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <img
              src={image}
              alt="section"
              className="w-full h-auto max-w-[400px] mx-auto"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TextImage;
