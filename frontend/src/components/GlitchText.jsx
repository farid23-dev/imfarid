import { motion } from "framer-motion";
import "../styles/glitch.css";

export default function GlitchText({ children, className = "" }) {
  return (
    <motion.span
      className={`glitch ${className}`}
      data-text={children}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.span>
  );
}
