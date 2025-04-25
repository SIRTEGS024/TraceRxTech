const ReusableInput = ({ placeholder, icon: Icon, variant = 'white' }) => {
  const isBlack = variant === 'black';

  const borderColor = isBlack 
    ? 'border-black/60 group-focus-within:border-black' // Slightly more opaque border for better visibility
    : 'border-white/60 group-focus-within:border-white'; // Slightly more opaque border for better visibility
    
  const placeholderColor = isBlack ? 'placeholder-black' : 'placeholder-white'; // Fully opaque placeholder color
  const textColor = isBlack ? 'text-black' : 'text-white';
  const iconColor = isBlack 
    ? 'text-black/80 group-focus-within:text-black' // Slightly higher opacity for icon visibility
    : 'text-white/80 group-focus-within:text-white'; // Slightly higher opacity for icon visibility

  return (
    <div className={`relative border-b ${borderColor} max-w-md group transition-colors duration-200`}>
      {Icon && (
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 pl-2 ${iconColor} transition-colors duration-200`}>
          <Icon />
        </div>
      )}
      <input
        type="text"
        placeholder={placeholder}
        className={`bg-transparent w-full py-2 pl-8 pr-2 focus:outline-none ${placeholderColor} ${textColor}`}
      />
    </div>
  );
};

export default ReusableInput;
