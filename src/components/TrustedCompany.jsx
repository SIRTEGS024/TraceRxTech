import ImageRowCarousel from "./ImageRowCarousel";
import TitleSubtext from "./TitleSubtext";

const TrustedCompanies = ({ companyLogos, title, size, color }) => {
  return (
    <div className="bg-white pt-40 pb-20 px-[10%] relative">
      <TitleSubtext title={title} size={size} color={color} />
      <ImageRowCarousel companyLogos={companyLogos} />
    </div>
  );
};

export default TrustedCompanies;
