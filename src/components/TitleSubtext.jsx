const TitleSubtext = ({
  title,
  subTitle,
  color = "black",
  size = "medium",
  underline = "default",
}) => {
  // Title styles
  const titleSizeMap = {
    xLarge: "text-4xl md:text-5xl lg:text-7xl", // extra large title
    large: "text-2xl md:text-3xl lg:text-4xl",
    medium: "text-xl md:text-2xl lg:text-3xl",
    small: "text-base md:text-lg lg:text-xl",
  };

  const subTitleSizeMap = {
    xLarge: "text-xl md:text-2xl lg:text-3xl", // Increased each by one size
    large: "text-base md:text-lg lg:text-xl",
    medium: "text-sm md:text-base lg:text-lg",
    small: "text-xs md:text-sm lg:text-base",
  };



  const titleTextColor = color === "white" ? "text-white" : "text-green-800";
  const subTitleTextColor = color === "white" ? "text-white" : "text-green-600";
  const underlineColor = color === "white" ? "bg-white" : "bg-green-700";

  return (
    <div className="text-center mt-3 mb-3"> {/* Reduced bottom margin */}
      {/* Title Section */}
      <div className="text-center mb-4"> {/* Reduced bottom margin */}
        <h2
          className={`font-semibold ${titleSizeMap[size]} ${titleTextColor} mb-3 break-words hyphens-auto text-balance leading-tight max-w-4xl mx-auto px-4`}
        >
          {title}
        </h2>

        {underline !== "none" && (
          <div className={`h-0.5 w-16 ${underlineColor} mx-auto`}></div>
        )}
      </div>

      {/* Optional Subtitle Section */}
      {subTitle && (
        <p
          className={`${subTitleSizeMap[size]} ${subTitleTextColor} max-w-3xl mx-auto leading-relaxed`} // Removed font-semibold
        >
          {subTitle}
        </p>
      )}
    </div>
  );
};

export default TitleSubtext;