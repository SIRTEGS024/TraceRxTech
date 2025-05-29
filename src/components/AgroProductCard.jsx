const AgroProductCard = ({ name, states, image, description }) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-10 bg-white shadow-xl rounded-2xl p-10 h-full">
      {/* Text Section */}
      <div className="flex-1 space-y-6">
        <h3 className="text-green-700 font-semibold text-xl uppercase tracking-wide">Agro Product</h3>
        <h2 className="text-5xl text-green-900 font-extrabold">{name}</h2>
        <p className="text-green-800 text-lg">{description}</p>
        <div>
          <h4 className="text-green-700 font-semibold text-lg mt-4">Produced in:</h4>
          <ul className="list-disc list-inside text-green-800 text-lg pl-2 space-y-2">
            {states.map((state) => (
              <li key={state} className="capitalize">{state}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Image Section */}
      <div className="flex-1 max-w-[90%] md:max-w-[100%]">
        <img
          src={image}
          alt={`${name} production map`}
          className="w-full h-auto object-contain rounded-xl border border-green-200"
        />
      </div>
    </div>
  );
};

export default AgroProductCard;
