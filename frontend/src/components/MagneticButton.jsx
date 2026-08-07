import { useRef, useState } from "react";
import { motion } from "framer-motion";

export default function MagneticButton({ children, className, ...props }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    setPosition({
      x: (clientX - centerX) * 0.35,
      y: (clientY - centerY) * 0.35,
    });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.span
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      style={{ display: "inline-block" }}
    >
      <motion.span
        className={className}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}
