// TailoredCard.jsx
const TailoredCard = ({ heading, subtext, tailoredFor, buttonText }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col h-full w-full"> {/* Added h-full */}
      <div className="space-y-4 mb-4 flex-grow"> {/* Added flex-grow */}
        <h3 className="text-green-700 font-bold text-xl">{heading}</h3>
        <p className="text-gray-700">{subtext}</p>

        <p className="font-semibold">Tailored Solutions For:</p>
        <div className="flex flex-wrap gap-2">
          {tailoredFor.map((item, idx) => (
            <span
              key={idx}
              className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Button pushed to the bottom */}
      <div className="mt-auto">
        <button className="bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded hover:bg-green-800 transition w-full">
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default TailoredCard;