// components/ExecutiveCard.jsx
const ExecutiveCard = ({ name, role, image }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <img src={image} alt={name} className="w-full h-64 object-cover" />
      <div className="p-4 text-center">
        <h4 className="text-lg font-bold text-green-800">{name}</h4>
        <p className="text-gray-600">{role}</p>
      </div>
    </div>
  );
};

export default ExecutiveCard;

