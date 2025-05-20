import { Link } from "react-router-dom";

const PlatformCards = ({ platforms }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
      {platforms.map((platform, index) => (
        <Link
          key={index}
          to={platform.url}
          className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 h-20 flex items-center min-w-[200px] text-[14px] font-semibold text-gray-600 text-center leading-tight"
        >
          <h3 className="w-full">{platform.title}</h3>
        </Link>
      ))}
    </div>
  );
};

export default PlatformCards;
