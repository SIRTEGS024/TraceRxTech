import { FaLeaf, FaHandshake, FaRocket } from "react-icons/fa";

const icons = {
  technology: <FaRocket className="text-green-600 text-2xl" />,
  reseller: <FaHandshake className="text-green-600 text-2xl" />,
  consultation: <FaLeaf className="text-green-600 text-2xl" />,
};

const PartnerTypeCard = ({ title, description, benefits }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 transition hover:shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        {icons[title.toLowerCase().split(" ")[0]]}
        <h3 className="text-2xl font-semibold text-green-800">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        {benefits.map((benefit, i) => (
          <li key={i}>{benefit}</li>
        ))}
      </ul>
    </div>
  );
};

export default PartnerTypeCard;
