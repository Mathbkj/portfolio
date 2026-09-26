import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import cloudLayer from "../assets/cloud-layer.png";

function CloudSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]);

  return (
    <section
      ref={ref}
      id="cloud-section"
      className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-gray-200"
    >
      <motion.img
        src={cloudLayer}
        alt=""
        style={{ y }}
        className="pointer-events-none relative z-20 w-full select-none object-cover"
      />
    </section>
  );
}

export default CloudSection;
