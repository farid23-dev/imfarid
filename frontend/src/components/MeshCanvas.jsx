import { useEffect, useRef } from "react";

export default function MeshCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    const blobs = [
      { x: 0.2, y: 0.25, r: 0.38, color: [46, 242, 200], speed: 0.25, phase: 0 },
      { x: 0.75, y: 0.2, r: 0.32, color: [77, 124, 255], speed: 0.2, phase: 1.5 },
      { x: 0.5, y: 0.55, r: 0.4, color: [255, 91, 61], speed: 0.22, phase: 2.8 },
      { x: 0.15, y: 0.7, r: 0.3, color: [255, 160, 90], speed: 0.28, phase: 4.0 },
      { x: 0.85, y: 0.65, r: 0.28, color: [100, 200, 255], speed: 0.18, phase: 5.2 },
      { x: 0.4, y: 0.85, r: 0.25, color: [180, 100, 255], speed: 0.24, phase: 6.1 },
    ];

    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time) => {
      frame = requestAnimationFrame(draw);
      const t = time * 0.001;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (const blob of blobs) {
        const ox = Math.sin(t * blob.speed + blob.phase) * 0.1;
        const oy = Math.cos(t * blob.speed * 0.85 + blob.phase) * 0.08;
        const pulse = 1 + Math.sin(t * blob.speed * 1.2 + blob.phase) * 0.12;
        const x = (blob.x + ox) * width;
        const y = (blob.y + oy) * height;
        const radius = Math.max(width, height) * blob.r * pulse;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const [r, g, b] = blob.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.5)`);
        gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.2)`);
        gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.08)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.7,
      }}
      aria-hidden="true"
    />
  );
}
