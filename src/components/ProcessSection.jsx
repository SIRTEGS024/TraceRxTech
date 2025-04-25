import ProcessItem from "./ProcessItem";
import TitleSubtext from "./TitleSubtext";

const ProcessSection = ({ title, subTitle, processData }) => {
  const shouldShowHeader = title || subTitle;

  return (
    <div className="w-full bg-gray-100 py-12 px-4 md:px-12">
      {shouldShowHeader && (
        <TitleSubtext
          title={title}
          subTitle={subTitle}
          size="medium"
          underline="default"
        />
      )}

      <div className="mb-12">
        {processData.processTitle && (
          <h2 className="text-center font-bold text-gray-800 text-base mb-6">
            {processData.processTitle}
          </h2>
        )}

        <div className="space-y-12">
          {processData.processes.map((process, i) => (
            <ProcessItem
              key={i}
              {...process}
              reverse={i % 2 !== 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessSection;
