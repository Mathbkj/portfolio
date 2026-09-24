import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

// Portion of the scroll range each letter spends rising into place.
const LETTER_SPAN = 0.35;

function RiseLetter({ char, index, total, progress }) {
  const start = (index / Math.max(total - 1, 1)) * (1 - LETTER_SPAN);
  const y = useTransform(progress, [start, start + LETTER_SPAN], ["110%", "0%"]);

  return (
    <span aria-hidden="true" className="inline-block overflow-hidden align-top">
      <motion.span className="inline-block" style={{ y }}>
        {char}
      </motion.span>
    </span>
  );
}

// Same rise-from-below letter stagger as AnimatedHeadline, driven by scroll.
function ScrollRiseText({ as: Tag = "h2", text, className = "" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.55"],
  });

  const words = text.split(" ");
  const total = words.join("").length;
  let index = 0;

  return (
    <Tag ref={ref} className={className} style={{ lineHeight: 1 }} aria-label={text}>
      {words.map((word, w) => (
        <span key={w} className="inline-block whitespace-nowrap">
          {Array.from(word).map((char) => (
            <RiseLetter
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
    </Tag>
  );
}

export default ScrollRiseText;
