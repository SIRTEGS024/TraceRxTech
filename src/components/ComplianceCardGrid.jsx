import ComplianceCard from "./ComplianceCard";
import TitleSubtext from "./TitleSubtext";

const ComplianceCardGrid = ({ complianceCardData, title, size, color, subTitle }) => {
  return (
    <div className="bg-green-700 py-12 px-4">
      <TitleSubtext
        title={title}
        color={color}
        size={size}
        subTitle={subTitle}
      />
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6 mt-10 place-items-center">
        {complianceCardData.map((card, index) => (
          <ComplianceCard
            key={index}
            heading={card.heading}
            items={card.items}
            buttonText={card.buttonText}
          />
        ))}
      </div>
    </div>
  );
};

export default ComplianceCardGrid;
