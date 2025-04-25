import { HiOutlineArrowNarrowRight } from "react-icons/hi";

const InfoCard = ({ heading, subText, link, onHeadingClick, isActive }) => {
  return (
    <div className={`rounded-xl shadow-md overflow-hidden w-full transition-colors duration-300 ${isActive ? "bg-green-50/50" : "bg-white"}`}>
      <div className="p-5">
        <h3
          className={`text-lg font-semibold mb-2 cursor-pointer ${isActive ? "text-green-700" : "text-gray-800"}`}
          onClick={onHeadingClick}
        >
          {heading}
        </h3>
        <p className="text-gray-600 text-sm mb-4">{subText}</p>
        <a
          href="#"
          className="text-green-600 underline inline-flex items-center gap-1 text-sm font-medium"
        >
          {link}
          <HiOutlineArrowNarrowRight size={16} className="ml-1" />
        </a>
      </div>
    </div>
  );
};

export default InfoCard;
