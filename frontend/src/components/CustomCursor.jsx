import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";
import "../styles/cursor.css";

export default function CustomCursor() {
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [visible, setVisible] = useState(false);

  const spring = { damping: 25, stiffness: 300 };
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);

  useEffect(() => {
    if ("ontouchstart" in window) return;

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const down = () => setClicking(true);
    const up = () => setClicking(false);

    const over = (e) => {
      const t = e.target;
      if (t.closest("a, button, [role='button']")) setHovering(true);
    };

    const out = (e) => {
      const t = e.target;
      if (t.closest("a, button, [role='button']")) setHovering(false);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
    };
  }, [x, y, visible]);

  if (typeof window !== "undefined" && "ontouchstart" in window) return null;

  return (
    <motion.div
      className={`cursor ${hovering ? "hover" : ""} ${clicking ? "click" : ""}`}
      style={{ x, y, opacity: visible ? 1 : 0 }}
    >
      <motion.div
        className="cursor__dot"
        animate={{ scale: clicking ? 0.5 : hovering ? 0.8 : 1 }}
      />
      <motion.div
        className="cursor__ring"
        animate={{ scale: clicking ? 0.7 : hovering ? 1.8 : 1 }}
      />
    </motion.div>
  );
}
