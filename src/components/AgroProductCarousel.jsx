import { useState, useEffect } from "react";
import AgroProductCard from "./AgroProductCard";

const AgroProductCarousel = ({ agroProducts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const nextSlide = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === agroProducts.length - 1 ? 0 : prev + 1));
      setFade(true);
    }, 700); // slower fade out (was 300)
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000); // Slide changes every 5 seconds
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleDotClick = (idx) => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex(idx);
      setFade(true);
    }, 700);
  };

  return (
   <section className="pt-16  px-6 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-green-900 mb-2">Agro Products</h2>
          <div className="w-16 h-1 bg-green-600 mx-auto rounded"></div>
        </div>

        {/* Carousel */}
        <div className="relative  transition-opacity duration-700">
          <div className={`transition-opacity duration-700 ease-in-out ${fade ? "opacity-100" : "opacity-0"}`}>
            <AgroProductCard {...agroProducts[currentIndex]} />
          </div>

          {/* Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {agroProducts.map((_, idx) => (
              <span
                key={idx}
                onClick={() => handleDotClick(idx)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                  idx === currentIndex ? "bg-green-700" : "bg-green-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgroProductCarousel;
