const ReusableInput = ({
  placeholder,
  icon: Icon,
  variant = 'white',
  value,
  onChange,
  id,
  ariaLabel,
  className = '',
  ...rest
}) => {
  const isBlack = variant === 'black';

  const borderColor = isBlack
    ? 'border-black/60 group-focus-within:border-black'
    : 'border-white/60 group-focus-within:border-white';

  const placeholderColor = isBlack ? 'placeholder-black' : 'placeholder-white';
  const textColor = isBlack ? 'text-black' : 'text-white';
  const iconColor = isBlack
    ? 'text-black/80 group-focus-within:text-black'
    : 'text-white/80 group-focus-within:text-white';

  const inputPaddingLeft = Icon ? 'pl-8' : 'pl-2';

  return (
    <div
      className={`relative border-b ${borderColor} max-w-md group transition-colors duration-200 ${className}`}
    >
      {Icon && (
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 pl-2 ${iconColor} transition-colors duration-200`}
        >
          <Icon />
        </div>
      )}
      <input
        id={id}
        aria-label={ariaLabel || placeholder}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`bg-transparent w-full py-2 ${inputPaddingLeft} pr-2 focus:outline-none ${placeholderColor} ${textColor}`}
        {...rest}
      />
    </div>
  );
};

export default ReusableInput;
