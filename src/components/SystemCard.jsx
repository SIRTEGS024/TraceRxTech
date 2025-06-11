const SystemCard = ({ image, title, subtext, buttonText }) => {
  return (
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden p-4 flex flex-col text-center h-full">
      <img
        src={image}
        alt={title}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      <div className="flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-green-800 text-lg font-semibold mb-2">{title}</h3>
          <p className="text-green-600 text-sm mb-4">{subtext}</p>
        </div>
        <button className="mt-auto border border-green-600 text-green-600 bg-white px-4 py-2 rounded-full transition-all duration-300 hover:bg-green-600 hover:text-white">
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SystemCard;
