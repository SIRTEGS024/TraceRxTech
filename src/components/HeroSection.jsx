import { FiCheck, FiArrowRight } from "react-icons/fi";
import TitleSubtext from "./TitleSubtext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { motion } from "framer-motion";

export default function HeroCarousel({ slides = [] }) {
  return (
    <div className="w-full text-black  relative"> {/* Removed pt-20 to align with navbar */}
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 5000 }}
        pagination={{
          clickable: true,
          renderBullet: (index, className) =>
            `<span class="${className} w-3 h-3 mx-[6px] border-2 border-white rounded-full ${
              className.includes('swiper-pagination-bullet-active')
                ? 'bg-emerald-500 opacity-100'
                : 'bg-white opacity-50'
            }"></span>`,
        }}
        modules={[Autoplay, Pagination]}
        className="w-full"
      >
        {slides.map((item, index) => (
          <SwiperSlide key={index}>
            <div
              className="w-full bg-cover bg-center bg-no-repeat relative min-h-[80vh]"
              style={{
                backgroundImage: `url(${item.image?.src})`,
              }}
            >
              {/* Green transparent overlay over the section */}
              <div className="absolute inset-0 bg-emerald-700/40 z-0" />

              <div className="relative z-10 flex flex-col items-center text-center w-full max-w-7xl mx-auto px-4 py-24 text-white">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <TitleSubtext
                    title={item.heading}
                    subTitle={item.subheading}
                    underline="none"
                    size="large"
                    color="white"
                  />
                </motion.div>

                {item.checklist.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col gap-3 mb-10 w-full"
                  >
                    <div className="mx-auto w-fit flex flex-col items-start text-left">
                      {item.checklist.map((point, i) => (
                        <div key={i} className="flex items-start gap-3 w-full">
                          <div className="bg-white rounded-full p-1 mt-1">
                            <FiCheck className="text-emerald-600 text-base" />
                          </div>
                          <p className="text-base text-white">{point}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 items-center mt-4">
                  {item.primaryButton && (
                    <button className="bg-transparent border border-white text-white px-6 py-3 rounded-md font-bold hover:bg-white hover:text-black  transition duration-200 flex items-center gap-2 text-sm w-full sm:w-auto sm:min-w-[200px]">
                      {item.primaryButton.text}
                      <FiArrowRight />
                    </button>
                  )}
                  {item.secondaryButton && (
                    <button className="bg-transparent border border-white text-white px-6 py-3 rounded-md font-bold hover:bg-white hover:text-black transition duration-200 text-sm w-full sm:w-auto">
                      {item.secondaryButton.text}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
