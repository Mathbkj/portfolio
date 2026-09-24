import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

// Portion of the scroll range each letter spends going from blurred to sharp.
const LETTER_SPAN = 0.35;
const MAX_BLUR = 18;

function BlurLetter({ char, index, total, progress }) {
  const staggerRange = 1 - LETTER_SPAN;
  const start = (index / Math.max(total - 1, 1)) * staggerRange;
  const end = start + LETTER_SPAN;

  const filter = useTransform(progress, [start, end], [`blur(${MAX_BLUR}px)`, "blur(0px)"]);
  const opacity = useTransform(progress, [start, end], [0, 1]);

  return (
    <motion.span aria-hidden="true" className="inline-block" style={{ filter, opacity }}>
      {char}
    </motion.span>
  );
}

// Each letter goes from blurred to sharp in sequence, driven by scroll progress.
function BlurText({ text, className = "" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.5"],
  });

  const words = text.split(" ");
  const total = words.join("").length;
  let index = 0;

  return (
    <h2 ref={ref} className={className} aria-label={text}>
      {words.map((word, w) => (
        <span key={w} className="inline-block whitespace-nowrap">
          {Array.from(word).map((char) => (
            <BlurLetter
              key={index}
              char={char}
              index={index++}
              total={total}
              progress={scrollYProgress}
            />
          ))}
          {w < words.length - 1 && " "}
        </span>
      ))}
    </h2>
  );
}

export default BlurText;
