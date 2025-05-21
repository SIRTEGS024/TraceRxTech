import SystemCard from "./SystemCard";
import TitleSubtext from "./TitleSubtext";

const SystemCardSection = ({title, subTitle, systemData }) => {
  return (
    <section className="px-4 py-10 bg-gray-100">
      <TitleSubtext
        title={title}
        subTitle={subTitle}
        color="black"
        size="medium"
        underline="default"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {systemData.map((system, index) => (
          <SystemCard
            key={index}
            image={system.image}
            title={system.title}
            subtext={system.subtext}
            buttonText={system.buttonText}
          />
        ))}
      </div>
    </section>
  );
};

export default SystemCardSection;