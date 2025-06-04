import ImageRowCarousel from "./ImageRowCarousel";
import TitleSubtext from "./TitleSubtext";

const TrustedCompanies = ({ companyLogos, title, size = "medium", color, subTitle }) => {
  return (
    <div className="bg-white pt-6 pb-2 px-[10%] relative">
      <TitleSubtext title={title} subTitle={subTitle} size={size} color={color} />
      <ImageRowCarousel companyLogos={companyLogos} />
    </div>
  );
};

export default TrustedCompanies;
