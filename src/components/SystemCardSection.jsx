import SystemCard from "./SystemCard";
import TitleSubtext from "./TitleSubtext";
import { FaArrowRight, FaArrowDown } from "react-icons/fa";

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
      <div className="flex flex-col lg:flex-row max-w-6xl mx-auto py-6 justify-center gap-4">
        {systemData.map((system, index) => (
          <div
            key={index}
            className="flex flex-col lg:flex-row lg:items-center items-center"
          >
            <SystemCard
              image={system.image}
              title={system.title}
              subtext={system.subtext}
              buttonText={system.buttonText}
            />
            {/* Arrow after each card, hidden for the last card */}
            {index < systemData.length - 1 && (
              <div className="flex items-center justify-center my-6 lg:my-0 lg:mx-4">
                <FaArrowDown className="w-6 h-6 text-green-600 lg:hidden" />
                <FaArrowRight className="w-6 h-6 text-green-600 hidden lg:block" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};


export default SystemCardSection;
