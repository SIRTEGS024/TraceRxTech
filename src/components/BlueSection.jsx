const BlueSection = ({
  title,
  subtitle,
  buttonText,
  imageSrc,
  imageAlt,
}) => {
  return (
    <div className="bg-white py-8 md:py-12 px-4 md:px-6 lg:px-12">
      <div className="bg-green-800 rounded-xl md:rounded-2xl py-8 px-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
          {/* Text section */}
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-white mb-4">{subtitle}</p>
            <button className="bg-white text-green-800 font-semibold px-6 py-2 rounded shadow hover:bg-opacity-90 transition">
              {buttonText}
            </button>
          </div>

          {/* Image section */}
          <div className="w-full md:w-auto">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full max-w-[400px] rounded-lg object-cover h-[200px] md:h-[250px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueSection;
