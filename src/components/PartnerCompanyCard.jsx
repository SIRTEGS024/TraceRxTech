const PartnerCompanyCard = ({ logo, name, address, role }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4 border hover:shadow-lg">
      <img src={logo} alt={name} className="w-16 h-16 object-contain" />
      <div>
        <h3 className="text-lg font-semibold text-green-800">{name}</h3>
        <p className="text-sm text-gray-600">{address}</p>
        <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
          {role}
        </span>
      </div>
    </div>
  );
};

export default PartnerCompanyCard;
