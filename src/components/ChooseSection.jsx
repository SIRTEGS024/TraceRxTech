import ChooseCard from "./ChooseCard";
import TitleSubtext from "./TitleSubtext";

const ChooseSection = ({ title, cardData }) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <TitleSubtext title={title} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {cardData.map((card, index) => (
          <ChooseCard
            key={index}
            logo={card.logo}
            title={card.title}
            subtext={card.subtext}
          />
        ))}
      </div>
    </div>
  );
};

export default ChooseSection;
