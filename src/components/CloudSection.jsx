import { useRef } from "react";
import { useScroll, useTransform, motion } from "motion/react";
import cloudGradient from "../assets/cloud-gradient.png";
import cloud2Full from "../assets/cloud-2-full.png";
import cloud1Cropped from "../assets/cloud-1-cropped.png";
import ScrollRiseText from "./ScrollRiseText";

// One cloud layer tinted to the site background: a bg-colored layer is
// multiplied over the (white/gray) cloud inside an isolated group, and masked
// by the cloud's own alpha so transparent areas stay transparent.
function CloudLayer({ src, y }) {
  const mask = {
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskSize: "cover",
    WebkitMaskSize: "cover",
    maskPosition: "bottom",
    WebkitMaskPosition: "bottom",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  };

  // Fade the layer's bottom edge so, once scrolled up, it dissolves into the
  // page background instead of ending in a hard line.
  const fade = "linear-gradient(to bottom, #000 70%, transparent)";

  return (
    <motion.div
      style={{ y, maskImage: fade, WebkitMaskImage: fade }}
      className="absolute inset-0 isolate"
    >
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-bottom"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-bg mix-blend-multiply"
        style={mask}
      />
    </motion.div>
  );
}

// Three cloud layers scroll upward at different speeds (parallax), the
// gradient in back moving slowest, the cropped layer up front fastest.
function CloudSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const yGradient = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const yFull = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);
  const yCropped = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]);

  return (
    // -mt overlaps the Hero above so clouds, translated up, visually rise
    // into that section instead of stopping at this section's own edge.
    <section
      ref={ref}
      className="relative z-10 -mt-[40vh] h-[190vh] w-full shrink-0"
    >
      <CloudLayer src={cloudGradient} y={yGradient} />
      <CloudLayer src={cloud2Full} y={yFull} />
      <CloudLayer src={cloud1Cropped} y={yCropped} />
      <div className="absolute top-1/2 right-6 max-w-2xl -translate-y-1/2 md:right-12">
        <ScrollRiseText
          text="I blend code, design and 3D to create digital experiences that feel alive. From subtle interactions to immersive environments, I build websites designed to be experienced, not just viewed."
          className="m-0 text-right text-3xl text-text-h md:text-5xl"
        />
      </div>
    </section>
  );
}

export default CloudSection;
