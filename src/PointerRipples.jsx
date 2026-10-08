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
    const lifetime = 650;
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
      context.fillStyle = `rgba(180, 105, 255, ${opacity})`;
      if (outerGlow) {
        context.shadowColor = "rgba(169, 82, 255, 0.8)";
        context.shadowBlur = 12;
      }
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      if (outerGlow) {
        context.shadowBlur = 0;
        context.strokeStyle = "rgba(222, 184, 255, 0.85)";
        context.lineWidth = 1;
        context.stroke();
      }
      context.restore();
    };
    const draw = (now) => {
      frame = 0;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ripples = ripples.filter((point) => now - point.time < lifetime);
      ripples.forEach((point) => {
        const progress = (now - point.time) / lifetime;
        context.strokeStyle = `rgba(190, 120, 255, ${0.5 * (1 - progress) ** 2})`;
        context.lineWidth = 1.2;
        context.beginPath();
        context.arc(point.x, point.y, 8 + progress * 30, 0, Math.PI * 2);
        context.stroke();
      });
      if (head) circle(head.x, head.y, 8, 0.65, true);
      if (ripples.length) frame = requestAnimationFrame(draw);
    };
    const move = (event) => {
      if (event.pointerType !== "mouse" || motion.matches || !pointer.matches) return;
      const now = performance.now();
      head = { x: event.clientX, y: event.clientY, time: now };
      document.documentElement.classList.add("pointer-glow-active");
      if (!previous || (now - previous.time >= 65
        && Math.hypot(head.x - previous.x, head.y - previous.y) >= 8)) {
        ripples.push(head);
        previous = head;
        ripples = ripples.slice(-12);
      }
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
