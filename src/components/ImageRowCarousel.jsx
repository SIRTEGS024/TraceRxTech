import { useEffect, useRef, useState } from "react";

const ImageRowCarousel = ({ companyLogos }) => {
  const carouselRef = useRef(null);
  const wrapperRef = useRef(null);
  const animationRef = useRef(null);
  const positionRef = useRef(0);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    const checkShouldScroll = () => {
      const wrapper = wrapperRef.current;
      const carousel = carouselRef.current;
      if (!wrapper || !carousel) return;
      setShouldScroll(carousel.scrollWidth > wrapper.offsetWidth);
    };

    checkShouldScroll(); // Initial check

    window.addEventListener("resize", checkShouldScroll);
    return () => window.removeEventListener("resize", checkShouldScroll);
  }, [companyLogos]);

  useEffect(() => {
    if (!shouldScroll) return;

    const carousel = carouselRef.current;
    if (!carousel) return;

    const logoWidth = 150;
    const gap = 40;
    const itemWidth = logoWidth + gap;
    const scrollSpeed = 1;

    const animate = () => {
      positionRef.current += scrollSpeed;

      if (positionRef.current >= itemWidth) {
        const firstChild = carousel.firstElementChild;
        if (!firstChild) return;

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

    return () => cancelAnimationFrame(animationRef.current);
  }, [shouldScroll]);

  return (
    <div
      ref={wrapperRef}
      className="mx-auto overflow-hidden w-[90%]"
    >
      <div
        ref={carouselRef}
        className="flex items-center gap-10"
        style={{ willChange: "transform" }}
      >
        {companyLogos.map((logo, index) => (
          <a
            key={index}
            href={logo.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 mx-auto w-[150px] h-[150px]" // Fixed container size
          >
            <img
              src={logo.src}
              alt={`Company ${index + 1}`}
              className="object-contain w-[150px] h-[150px] hover:scale-105 transition-transform" // Fixed image size
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export default ImageRowCarousel;