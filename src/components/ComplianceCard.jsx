const ComplianceCard = ({ heading, items, buttonText }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-[380px] h-[420px] flex flex-col">
      <div className="grid grid-rows-[auto_1fr_auto] h-full gap-0">
        {/* Heading */}
        <h3 className="text-xl font-semibold text-green-700 mb-4">{heading}</h3>

        {/* List - Tightly controlled spacing */}
        <ul className="list-disc pl-4 text-gray-800 text-base font-medium pb-0">
          {items.map((item, index) => (
            <li key={index} className="mb-1 last:mb-0">
              {item}
            </li>
          ))}
        </ul>

        {/* Button - Absolutely no extra margin */}
        <div className="mt-0">
          <button className="bg-green-700 hover:bg-green-600 text-white text-base font-medium py-2.5 px-5 rounded transition w-full">
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceCard;
