const ImageRow = ({ companyLogos }) => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-8">
      {companyLogos.map((logo) => (
        <img
          key={logo.id}
          src={logo.src}
          alt={logo.alt}
          className="w-32 h-auto"
        />
      ))}
    </div>
  );
};

export default ImageRow;
