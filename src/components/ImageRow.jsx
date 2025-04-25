
const ImageRow = ({ companyLogos }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
      {companyLogos.map((logo) => (
        <img
          key={logo.id}
          src={logo.src}
          alt={logo.alt}
          className="w-1/2 h-auto mx-auto"
        />
      ))}
    </div>
  );
};

export default ImageRow;
