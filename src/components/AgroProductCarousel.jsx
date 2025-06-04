import { useState, useEffect } from "react";
import AgroProductCard from "./AgroProductCard";
import TitleSubtext from "./TitleSubtext";

const AgroProductCarousel = ({ agroProducts, title, subtitle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) =>
        prev === agroProducts.length - 1 ? 0 : prev + 1
      );
      setFade(true);
    }, 700);
  };

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, isHovered]);

  const handleDotClick = (idx) => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex(idx);
      setFade(true);
    }, 700);
  };

  return (
    <section className="pt-16 px-6 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto">
        <TitleSubtext
          title={title}
          subTitle={subtitle}
          size="large"
        />

        {/* Carousel */}
        <div
          className="relative transition-opacity duration-700"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={`transition-opacity duration-700 ease-in-out ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          >
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
