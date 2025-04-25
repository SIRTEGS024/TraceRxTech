// TailoredCardSection.jsx
import TailoredCard from "./TailoredCard";
import TitleSubtext from "./TitleSubtext";

const TailoredCardSection = ({ tailoredCards, title, subTitle, size }) => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
        <TitleSubtext title={title} subTitle={subTitle} size={size} />

        {/* Adjusted Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(2,minmax(0,1fr))] gap-x-10 gap-y-6 w-full">
          {tailoredCards.map((card, idx) => (
            <div key={idx} className="w-full h-full sm:px-2"> {/* Added horizontal padding */}
              <TailoredCard {...card} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TailoredCardSection;