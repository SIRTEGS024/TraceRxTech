import OvalCard from "./OvalCard";
import TitleSubtext from "./TitleSubtext";

const ComplianceOvalGrid = ({
  complianceOvalData,
  title,
  size,
  color,
  subTitle,
}) => {
  return (
    <div className="bg-blue-100/20 py-10 px-4">
      <TitleSubtext
        title={title}
        size={size}
        color={color}
        subTitle={subTitle}
      />
      <div className="flex flex-wrap justify-center gap-6 mt-6">
        {complianceOvalData.map((item, index) => (
          <OvalCard key={index} imageSrc={item.image} label={item.label} />
        ))}
      </div>
    </div>
  );
};

export default ComplianceOvalGrid;
