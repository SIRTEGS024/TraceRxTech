const OvalCard = ({ imageSrc, label }) => {
  return (
    <div className="w-32 h-52 bg-emerald-50 rounded-[2rem] shadow flex flex-col items-center justify-center text-center px-4 py-5">
      <img
        src={imageSrc}
        alt={label}
        className="w-16 h-16 object-contain mb-3"
      />
      <p className="text-sm font-medium text-gray-800">{label}</p>
    </div>
  );
};

export default OvalCard;
