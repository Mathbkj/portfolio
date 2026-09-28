import { useEffect, useRef } from "react";

// Renders children blended with the background. A second, unblended copy is
// revealed through a circular mask that follows the cursor.
function HoverBlend({ children, className = "", blendClassName = "mix-blend-overlay", radius = 90 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const move = (e) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
      el.style.setProperty("--r", `${radius}px`);
    };
    const leave = () => el.style.setProperty("--r", "0px");
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [radius]);

  // Square mask: intersect a horizontal and vertical linear-gradient fade,
  // both centered on the cursor, so the revealed shape is a soft-edged square.
  const maskX =
    "linear-gradient(90deg, transparent calc(var(--mx, 50%) - var(--r, 0px)), #000 calc(var(--mx, 50%) - var(--r, 0px) * 0.6), #000 calc(var(--mx, 50%) + var(--r, 0px) * 0.6), transparent calc(var(--mx, 50%) + var(--r, 0px)))";
  const maskY =
    "linear-gradient(180deg, transparent calc(var(--my, 50%) - var(--r, 0px)), #000 calc(var(--my, 50%) - var(--r, 0px) * 0.6), #000 calc(var(--my, 50%) + var(--r, 0px) * 0.6), transparent calc(var(--my, 50%) + var(--r, 0px)))";

  return (
    <div ref={ref} className={`pointer-events-none ${className}`}>
      <div className={blendClassName}>{children}</div>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          maskImage: `${maskX}, ${maskY}`,
          WebkitMaskImage: `${maskX}, ${maskY}`,
          maskComposite: "intersect",
          WebkitMaskComposite: "intersect",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default HoverBlend;
