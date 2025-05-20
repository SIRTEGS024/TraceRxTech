import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import React, { useState, useEffect, useCallback, useRef } from "react";

const ImageTextCarousel = ({ textImageCarousel = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef(null);
  const startXRef = useRef(null);
  const transitioningRef = useRef(false);

  const goToNext = useCallback(() => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    setCurrentIndex((prevIndex) =>
      prevIndex === textImageCarousel.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => (transitioningRef.current = false), 500);
  }, [textImageCarousel.length]);

  const goToPrev = () => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? textImageCarousel.length - 1 : prevIndex - 1
    );
    setTimeout(() => (transitioningRef.current = false), 500);
  };

  const goToSlide = (index) => setCurrentIndex(index);

  useEffect(() => {
    let intervalId;
    if (isAutoPlaying && textImageCarousel.length > 1) {
      intervalId = setInterval(goToNext, 5000);
    }
    return () => clearInterval(intervalId);
  }, [isAutoPlaying, goToNext, textImageCarousel.length]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (startXRef.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = startXRef.current - endX;

    if (Math.abs(diff) > 50) {
      diff > 0 ? goToNext() : goToPrev();
    }

    startXRef.current = null;
  };

  if (textImageCarousel.length === 0) return null;

  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {textImageCarousel.map((t, index) => (
            <div key={index} className="min-w-full px-4">
              <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12 max-w-6xl mx-auto">
                {/* Text Section */}
                <div className={`w-full ${t.image ? "md:w-1/2" : "md:w-full"}`}>
                  <div className="flex flex-col items-center md:items-start">
                    {t.logo && (
                      <img
                        src={t.logo}
                        alt="Company logo"
                        className="mb-4"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "contain",
                        }}
                      />
                    )}
                    {t.subtitle && (
                      <p className="text-base sm:text-lg font-bold text-black mb-2">
                        {t.subtitle}
                      </p>
                    )}
                    {t.title && (
                      <h3 className=" text-4xl text-green-700 font-bold mb-4">
                        {t.title}
                      </h3>
                    )}
                    {t.quote && (
                      <p className="text-base text-gray-700 mb-6">
                        {t.quote}
                      </p>
                    )}
                    {t.attribution && (
                      <p className="text-sm text-gray-500 mb-8">
                        {t.attribution}
                      </p>
                    )}
                    <button className="px-6 py-2 bg-green-700 text-white text-sm font-medium rounded hover:bg-green-800 transition-colors">
                      GO TO PORTAL
                    </button>
                  </div>
                </div>

                {/* Image Section */}
                {t.image && (
                  <div className="w-full md:w-1/2">
                    <img
                      src={t.image}
                      alt="Visual"
                      className="w-full h-auto max-h-[400px] object-contain rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        {textImageCarousel.length > 1 && (
          <div className="flex justify-center mt-6 mb-4 gap-3">
            <button
              onClick={goToPrev}
              className="bg-white p-1.5 rounded-full shadow-sm hover:bg-gray-100 transition-colors"
              aria-label="Previous testimonial"
            >
              <FaChevronLeft className="h-4 w-4 text-green-700" />
            </button>
            <button
              onClick={goToNext}
              className="bg-white p-1.5 rounded-full shadow-sm hover:bg-gray-100 transition-colors"
              aria-label="Next testimonial"
            >
              <FaChevronRight className="h-4 w-4 text-green-700" />
            </button>
          </div>
        )}

        {/* Indicator Dots */}
        {textImageCarousel.length > 1 && (
          <div className="flex justify-center space-x-2">
            {textImageCarousel.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index === currentIndex
                    ? "bg-green-700"
                    : "bg-gray-300 hover:bg-green-700"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageTextCarousel;
