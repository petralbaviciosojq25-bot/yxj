import { useEffect, useRef } from "react";

export function PointerRipples() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(any-pointer: fine)");
    if (!context) return undefined;
    let ripples = [];
    let frame = 0;
    let previous = null;
    let head = null;
    const lifetime = 450;
    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      ripples = [];
      previous = null;
      head = null;
      document.documentElement.classList.remove("pointer-glow-active");
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
    const resize = () => {
      clear();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const circle = (x, y, radius, opacity, outerGlow = false) => {
      context.save();
      context.fillStyle = `rgba(207, 177, 255, ${opacity})`;
      if (outerGlow) {
        context.shadowColor = "rgba(196, 150, 255, 0.35)";
        context.shadowBlur = 5;
      }
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      if (outerGlow) {
        context.shadowBlur = 0;
        context.strokeStyle = "rgba(235, 220, 255, 0.65)";
        context.lineWidth = 1;
        context.stroke();
      }
      context.restore();
    };
    const draw = (now) => {
      frame = 0;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ripples = ripples.filter((point) => now - point.time < lifetime);
      ripples.forEach((point, index) => {
        const age = Math.max(0, 1 - (now - point.time) / lifetime);
        const distance = Math.hypot(point.x - head.x, point.y - head.y);
        const proximity = Math.max(0, 1 - distance / 240);
        const recency = (index + 1) / ripples.length;
        circle(point.x, point.y, 5 + recency * 6,
          0.045 * age ** 2 * proximity * recency);
      });
      if (head) circle(head.x, head.y, 12, 0.5, true);
      if (ripples.length) frame = requestAnimationFrame(draw);
    };
    const move = (event) => {
      if (event.pointerType !== "mouse" || motion.matches || !pointer.matches) return;
      const now = performance.now();
      head = { x: event.clientX, y: event.clientY, time: now };
      document.documentElement.classList.add("pointer-glow-active");
      if (previous) {
        const distance = Math.hypot(head.x - previous.x, head.y - previous.y);
        const steps = Math.min(Math.ceil(distance / 8), 30);
        for (let step = 0; step < steps; step += 1) {
          const fraction = step / steps;
          ripples.push({
            x: previous.x + (head.x - previous.x) * fraction,
            y: previous.y + (head.y - previous.y) * fraction,
            time: now,
          });
        }
      }
      previous = head;
      ripples = ripples.slice(-40);
      if (!frame) frame = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", clear);
    window.addEventListener("blur", clear);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", clear);
    motion.addEventListener("change", clear);
    pointer.addEventListener("change", clear);
    return () => {
      clear();
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", clear);
      window.removeEventListener("blur", clear);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", clear);
      motion.removeEventListener("change", clear);
      pointer.removeEventListener("change", clear);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-ripples" aria-hidden="true" />;
}
