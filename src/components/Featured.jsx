import ImageRow from "./ImageRow";
import TitleSubtext from "./TitleSubtext";

const Featured = ({ companyLogos, title, size, color }) => {
  return (
    <div className="bg-gray-50 py-16 px-6 md:px-12">
      <TitleSubtext title={title} size={size} color={color} />
      <ImageRow companyLogos={companyLogos} />
    </div>
  );
};

export default Featured;
