import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import iceCream from "../assets/ice-cream.png";

// The can is rendered by a fixed, full-screen canvas (CokeCan), centered
// horizontally. Stickers are blown out from the bottom of the viewport, below
// the can, and rise as the page scrolls. Motion is tied directly to scroll
// progress, so they stop the moment scrolling stops.
const ORIGIN_BOTTOM = "8%";
const STICKERS_PER_SIDE = 9;
// Last point of the scroll range where a sticker can still be released.
const LAST_START = 0.75;
// How far a sticker rises (in vh) to clear the top of the viewport.
const RISE = 115;

// Deterministic pseudo-random so every render produces the same stickers.
function seeded(i) {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function buildStickers(side) {
  const dir = side === "left" ? -1 : 1;
  return Array.from({ length: STICKERS_PER_SIDE }, (_, i) => {
    const r = (n) => seeded(i * 7 + n + (side === "left" ? 0 : 100));
    // Each sticker settles into its own lane beside the can, then rises in it.
    const lane = 12 + r(1) * 34;
    const sway = 2 + r(2) * 4;
    const spin = (30 + r(3) * 60) * dir;
    return {
      key: `${side}-${i}`,
      size: 48 + r(5) * 36,
      start: ((i + r(4) * 0.8) / STICKERS_PER_SIDE) * LAST_START,
      // Scroll needed to cross the screen; smaller span means a faster sticker.
      span: 0.35 + r(6) * 0.2,
      x: [0, lane * 0.85, lane + sway, lane - sway, lane + sway].map((v) => `${dir * v}vw`),
      y: [0, 0.15, 0.4, 0.7, 1].map((t) => `${-t * RISE}vh`),
      rotate: [0, spin, -spin * 0.4, spin * 0.6, -spin * 0.3],
    };
  });
}

const STICKERS = [...buildStickers("left"), ...buildStickers("right")];

function Sticker({ sticker, progress }) {
  const { start, span, size } = sticker;
  const range = [0, 0.15, 0.4, 0.7, 1].map((t) => start + t * span);
  const x = useTransform(progress, range, sticker.x);
  const y = useTransform(progress, range, sticker.y);
  const rotate = useTransform(progress, range, sticker.rotate);
  const opacity = useTransform(progress, [start, start + span * 0.08], [0, 1]);
  const scale = useTransform(progress, [start, start + span * 0.15], [0.3, 1]);

  return (
    <motion.img
      src={iceCream}
      alt=""
      draggable={false}
      className="absolute left-1/2 select-none drop-shadow-md"
      style={{
        bottom: ORIGIN_BOTTOM,
        width: size,
        marginLeft: -size / 2,
        x,
        y,
        rotate,
        opacity,
        scale,
      }}
    />
  );
}

function WindSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    // Only while the sticky layer is pinned to the viewport.
    offset: ["start start", "end end"],
  });

  return (
    <section ref={ref} id="wind-section" className="pointer-events-none relative h-[300svh] w-full">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {STICKERS.map((s) => (
          <Sticker key={s.key} sticker={s} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}

export default WindSection;
