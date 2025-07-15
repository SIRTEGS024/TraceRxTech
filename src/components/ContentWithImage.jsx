import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const ContentWithImage = ({
  title,
  description,
  listTitle,
  items = [],
  buttonText,
  imageSrc,
  imageAlt
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 bg-white lg:bg-opacity-70 lg:backdrop-blur-sm p-6 lg:p-8 rounded-lg shadow-sm border border-gray-100">
      {/* Text content */}
      <div className="lg:w-1/2">
        {title && (
          <h3 className="text-xl md:text-2xl font-medium text-green-700 mb-4">
            {title}
          </h3>
        )}
        
        {description && (
          <p className="text-gray-600 mb-6">{description}</p>
        )}

        {items.length > 0 && (
          <div className="mb-6">
            {listTitle && (
              <h4 className="font-semibold text-gray-800 mb-3">{listTitle}</h4>
            )}
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              {items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {buttonText && (
          <Link
            to="/login" // Link to /login
            className="bg-green-700 text-white px-6 py-3 rounded-md font-medium hover:bg-green-800 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {buttonText}
            <FiArrowRight className="text-white" />
          </Link>
        )}
      </div>

      {/* Image */}
      {imageSrc && (
        <div className="lg:w-1/2 mt-6 lg:mt-0">
          <img
            src={imageSrc}
            alt={imageAlt || "Content illustration"}
            className="w-full h-auto object-cover rounded-lg"
            loading="eager"
            decoding="async"
          />
        </div>
      )}
    </div>
  );
};

export default ContentWithImage;