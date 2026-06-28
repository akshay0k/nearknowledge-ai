import Button from "../ui/Button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold leading-tight">
          Everything you know.
          <br />
          <span className="text-blue-400">One intelligent workspace.</span>
        </h1>

        <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">
          Upload your knowledge, organize your documents, and let AI help you
          discover insights instantly.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => navigate("/library")}>Upload </Button>
        <Button variant="secondary" onClick={() => navigate("/library")}>
          Open Library
        </Button>
      </div>
    </motion.div>
  );
};

export default Hero;
