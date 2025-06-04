import PlatformCards from "./PlatformCards";
import ContentWithImage from "./ContentWithImage";
import TitleSubtext from "./TitleSubtext";
import { RegulationTabs } from "./RegulationTabs";

const ImpactSection = ({ regulations, contentSection, title, subTitle, color = "green", size = "medium" }) => {
  return (
    <div className="bg-gray-50 py-20 px-[10%] space-y-16">
      <TitleSubtext
        title={title}
        color={color}
        size={size}
        subTitle={subTitle}
      />

      <div className="max-w-6xl mx-auto space-y-12">
        <RegulationTabs regulations={regulations} />
        <ContentWithImage {...contentSection.homeSection} />
      </div>
    </div>
  );
};

export default ImpactSection;
