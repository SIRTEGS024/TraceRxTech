import SystemCard from "./SystemCard";
import TitleSubtext from "./TitleSubtext";

const SystemCardSection = ({ title, subTitle, systemData }) => {
  return (
    <section className="px-4 py-10 bg-gray-100">
      <TitleSubtext
        title={title}
        subTitle={subTitle}
        color="black"
        size="medium"
        underline="default"
      />

     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {systemData.map((system, index) => (
         <div key={index} className="max-w-sm w-full mx-auto h-full">
            <SystemCard
              image={system.image}
              title={system.title}
              subtext={system.subtext}
              buttonText={system.buttonText}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default SystemCardSection;
