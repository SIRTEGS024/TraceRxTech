const SystemCard = ({ image, title, subtext, buttonText }) => {
  return (
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden p-4 flex flex-col items-center text-center">
      <img src={image} alt={title} className="w-full h-48 object-cover rounded-lg mb-4" />
      <h3 className="text-green-800 text-lg font-semibold mb-2">{title}</h3>
      <p className="text-green-600 text-sm mb-4">{subtext}</p>
      <button className="border border-green-600 text-green-600 bg-white px-4 py-2 rounded-full transition-all duration-300 hover:bg-green-600 hover:text-white">
        {buttonText}
      </button>
    </div>
  );
};

export default SystemCard;