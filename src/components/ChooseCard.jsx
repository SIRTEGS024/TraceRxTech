const ChooseCard = ({ logo, title, subtext }) => {
  return (
    <div className="bg-green-50 p-6 rounded-lg h-full"> {/* Very light green background */}
      <div className="bg-green-100 p-3 rounded-lg w-fit mb-4"> {/* Slightly darker green box for logo */}
        <img src={logo} alt="icon" className="w-8 h-8" />
      </div>
      
      <h3 className="text-green-800 font-semibold text-lg mb-2 border-l-4 border-green-600 pl-3">
        {title}
      </h3>
      
      <p className="text-gray-700 text-sm leading-relaxed">
        {subtext}
      </p>
    </div>
  );
};
export default ChooseCard;