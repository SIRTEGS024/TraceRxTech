import TitleSubtext from "./TitleSubtext";
import GradientCard from "./GradientCard";

const GradientCardSection = ({
  title,
  subTitle,
  size,
  color,
  gradientCards = [],
}) => {
  return (
    <section className="bg-green-700 py-16 px-4">
      <TitleSubtext
        title={title}
        subTitle={subTitle}
        size={size}
        color={color}
      />

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-items-center">
        {gradientCards.map((card, index) => (
          <GradientCard key={index} title={card.title} text={card.text} />
        ))}
      </div>
    </section>
  );
};

export default GradientCardSection;
