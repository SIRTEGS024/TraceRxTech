import ImageTextCarousel from "./ImageTextCarousel";
import TitleSubtext from "./TitleSubtext";

const TestimonialCarousel = ({ textImageCarousel, title, size, color }) => {
  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      <TitleSubtext title={title} size={size} color={color} />
      <ImageTextCarousel textImageCarousel={textImageCarousel} />
    </div>
  );
};

export default TestimonialCarousel;
