import React from "react";

const PlatformCards = ({ platforms }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
      {platforms.map((platform, index) => (
        <div
          key={index}
          className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 h-20 flex items-center min-w-[200px]"
        >
          <h3 className="text-[14px] font-semibold text-gray-600 text-center w-full leading-tight">
            {platform}
          </h3>
        </div>
      ))}
    </div>
  );
};

export default PlatformCards;