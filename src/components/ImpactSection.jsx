import PlatformCards from "./PlatformCards";
import ContentWithImage from "./ContentWithImage";
import TitleSubtext from "./TitleSubtext";

const ImpactSection = ({ platforms, contentSection, title, subTitle, color = "green", size = "medium" }) => {
  return (
    <div className="bg-gray-50 py-20 px-[10%]">
      <TitleSubtext
        title={title}
        color={color}
        size={size}
        subTitle={subTitle}
      />

      {/* Ultra-slim platform cards */}
      <PlatformCards platforms={platforms} />

      {/* EUDR section */}
      <ContentWithImage {...contentSection.homeSection} />
    </div>
  );
};

export default ImpactSection;
