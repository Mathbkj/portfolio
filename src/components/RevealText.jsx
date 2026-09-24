import { motion } from "motion/react";

const DURATION = 0.9;
const EASE = [0.76, 0, 0.24, 1];
const TAGS = { p: motion.p, h2: motion.h2 };

// A colored block sweeps left to right across the text; the text appears
// once the block has covered it and stays visible as the block exits.
// The in-view trigger lives on the wrapper because the block itself starts
// outside the wrapper's clipped area and would never intersect the viewport.
function RevealText({ as = "p", children, className = "", delay = 0 }) {
  const MotionTag = TAGS[as];

  return (
    <motion.span
      className="relative block w-fit overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
    >
      <MotionTag
        className={className}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: [0, 0, 1, 1],
            transition: { duration: DURATION, delay, times: [0, 0.5, 0.5, 1] },
          },
        }}
      >
        {children}
      </MotionTag>
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 bg-accent"
        variants={{
          hidden: { x: "-101%" },
          visible: {
            x: ["-101%", "0%", "101%"],
            transition: { duration: DURATION, delay, ease: [EASE, EASE], times: [0, 0.5, 1] },
          },
        }}
      />
    </motion.span>
  );
}

export default RevealText;
