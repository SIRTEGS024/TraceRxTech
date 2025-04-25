import { useState } from "react";
import InfoCard from "./InfoCard";
import TitleSubtext from "./TitleSubtext";
import { FONT } from "../constants";

const ImageRowColumnCardSection = ({ cardData = [], title, subTitle,size }) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const handleCardClick = (index) => {
    setActiveCardIndex(index);
  };

  return (
    <>
      <TitleSubtext
        title={title}
        size={size}
        subTitle={subTitle}
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-center px-4 py-12">
        {/* Dynamic Image on the left */}
        <div className="w-full md:w-1/2">
          <img
            src={cardData[activeCardIndex]?.image}
            alt="Section visual"
            className="w-full h-auto max-h-[500px] object-cover rounded-xl"
          />
        </div>

        {/* Cards on the right */}
        <div className="flex flex-col gap-6 w-full md:w-1/2">
          {cardData.map((card, index) => (
            <InfoCard
              key={index}
              {...card}
              isActive={index === activeCardIndex}
              onHeadingClick={() => handleCardClick(index)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ImageRowColumnCardSection;
