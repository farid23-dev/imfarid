import { motion } from "framer-motion";

export default function TextReveal({ children, delay = 0, className = "" }) {
  const words = children.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay },
    }),
  };

  const child = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.span
      className={className}
      style={{ display: "flex", flexWrap: "wrap", gap: "0.3em" }}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span key={index} variants={child} style={{ display: "inline-block" }}>
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}
