import { motion } from "motion/react";

function AnimatedHeadline({ text, className = "", delay = 0, stagger = 0.06 }) {
  return (
    <h1 className={className} style={{ lineHeight: 1 }} aria-label={text}>
      {Array.from(text).map((char, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block overflow-hidden align-top"
        >
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: delay + i * stagger,
            }}
          >
            {char === " " ? " " : char}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

export default AnimatedHeadline;
