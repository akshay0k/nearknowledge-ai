const Input = ({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  className = "",
}) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`
        w-full
        px-5
        py-4
        rounded-lg
        bg-[#0F172A]
        border
        border-[#25314A]
        outline-none
        text-white
        placeholder:text-slate-500
        focus:border-blue-500
        transition-all
        ${className}
      `}
    />
  );
};

export default Input;
