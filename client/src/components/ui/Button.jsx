import { motion } from "framer-motion";

const Button = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  className = "",
}) => {
  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20",

    secondary:
      "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700",

    danger:
      "bg-red-600 hover:bg-red-500 text-white",

    ghost:
      "bg-transparent hover:bg-zinc-800 text-zinc-300",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        px-5
        py-3
        rounded-lg
        font-medium
        transition-all
        duration-300
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};

export default Button;
