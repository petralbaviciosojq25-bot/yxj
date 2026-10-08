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
    const lifetime = 650;
    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      ripples = [];
      previous = null;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
    const resize = () => {
      clear();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = (now) => {
      frame = 0;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ripples = ripples.filter((ripple) => now - ripple.time < lifetime);
      for (const ripple of ripples) {
        const progress = (now - ripple.time) / lifetime;
        context.strokeStyle = `rgba(196, 155, 255, ${0.38 * (1 - progress) ** 2})`;
        context.lineWidth = 1;
        context.beginPath();
        context.arc(ripple.x, ripple.y, 7 + progress * 38, 0, Math.PI * 2);
        context.stroke();
      }
      if (ripples.length) frame = requestAnimationFrame(draw);
    };
    const move = (event) => {
      if (event.pointerType !== "mouse" || motion.matches || !pointer.matches) return;
      const now = performance.now();
      if (previous && now - previous.time < 45) return;
      if (previous && Math.hypot(event.clientX - previous.x, event.clientY - previous.y) < 6) return;
      previous = { x: event.clientX, y: event.clientY, time: now };
      ripples.push(previous);
      ripples = ripples.slice(-16);
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
