const StepCard = ({ title, description, step }) => (
  <div className="bg-white rounded-lg shadow p-6 text-center border border-green-100">
    <div className="text-green-700 text-3xl font-bold mb-4">{step}</div>
    <h4 className="text-xl font-semibold text-green-800 mb-2">{title}</h4>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default StepCard;
