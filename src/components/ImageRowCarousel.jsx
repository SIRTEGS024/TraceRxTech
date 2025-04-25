import { useEffect, useRef } from "react";

const ImageRowCarousel = ({ companyLogos }) => {
  const carouselRef = useRef(null);
  const animationRef = useRef(null);
  const positionRef = useRef(0);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const logoWidth = 150; // Adjust to match your logo width
    const gap = 40; // gap-10 = 40px
    const itemWidth = logoWidth + gap;
    const scrollSpeed = 1; // Pixels per frame (adjust speed)

    const animate = () => {
      positionRef.current += scrollSpeed;

      // When first logo completely exits view
      if (positionRef.current >= itemWidth) {
        const firstChild = carousel.firstElementChild;
        carousel.style.transition = "none";
        carousel.removeChild(firstChild);
        carousel.appendChild(firstChild);
        positionRef.current -= itemWidth;
        carousel.style.transform = `translateX(-${positionRef.current}px)`;
      } else {
        carousel.style.transition = "transform 0.05s linear";
        carousel.style.transform = `translateX(-${positionRef.current}px)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="w-[90%] mx-auto overflow-hidden">
      <div
        ref={carouselRef}
        className="flex items-center gap-10 py-5"
        style={{ willChange: "transform" }} // Optimize performance
      >
        {companyLogos.map((logo, index) => (
          <div key={index} className="flex-shrink-0 w-[150px]">
            {" "}
            {/* Fixed width container */}
            <img
              src={logo}
              alt={`Company ${index + 1}`}
              className="h-16 w-full object-contain hover:scale-105 transition-transform"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageRowCarousel;
