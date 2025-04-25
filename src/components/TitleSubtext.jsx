const TitleSubtext = ({
  title,
  subTitle,
  color = "black",
  size = "medium",
  underline = "default",
}) => {
  // Title styles
  const titleSizeMap = {
    large: "text-2xl md:text-3xl lg:text-4xl",
    medium: "text-xl md:text-2xl lg:text-3xl",
    small: "text-base md:text-lg lg:text-xl",
  };

  // Subtitle styles
  const subTitleSizeMap = {
    large: "text-sm md:text-base lg:text-lg",
    medium: "text-xs md:text-sm lg:text-base",
    small: "text-[11px] md:text-xs lg:text-sm",
  };

  const titleTextColor = color === "white" ? "text-white" : "text-green-800";
  const subTitleTextColor = color === "white" ? "text-white" : "text-green-600";
  const underlineColor = color === "white" ? "bg-white" : "bg-green-700";

  return (
    <div className="text-center mb-12"> {/* Reduced bottom margin */}
      {/* Title Section */}
      <div className="text-center mb-8"> {/* Reduced bottom margin */}
        <h2
          className={`font-semibold ${titleSizeMap[size]} ${titleTextColor} mb-3 break-words max-w-4xl mx-auto`} // Changed to font-bold
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