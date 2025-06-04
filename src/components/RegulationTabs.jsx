import { useState } from "react";

export const RegulationTabs = ({ regulations }) => {
  const [activeId, setActiveId] = useState(regulations[0]?.id || "");
  const activeReg = regulations.find((r) => r.id === activeId);

  return (
    <div className="bg-white p-6 lg:p-8 rounded-lg shadow-sm border border-gray-100 lg:bg-opacity-70 lg:backdrop-blur-sm">
      {/* Tab buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        {regulations.map((reg) => (
          <button
            key={reg.id}
            onClick={() => setActiveId(reg.id)}
            className={`py-2 px-4 rounded-full border transition-colors duration-200 ${
              reg.id === activeId
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            {reg.title}
          </button>
        ))}
      </div>

      {/* Description */}
      <div className="max-h-[500px] overflow-y-auto">
        <h2 className="text-2xl font-medium text-green-700 mb-4">{activeReg.title}</h2>
        <p className="text-gray-600 whitespace-pre-wrap">{activeReg.description}</p>
      </div>
    </div>
  );
};
