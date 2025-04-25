const GradientCard = ({ title, text }) => {
  return (
    <div className="transition-all duration-300 ease-in-out bg-white rounded-lg shadow-md px-5 py-16 min-h-[280px] text-center hover:bg-gradient-to-br hover:from-green-700 hover:to-green-500 group w-full max-w-[260px]">
      <h3 className="text-base font-bold text-black mb-3">{title}</h3>
      <p className="text-sm text-gray-700 group-hover:text-white">{text}</p>
    </div>
  );
};

export default GradientCard;
