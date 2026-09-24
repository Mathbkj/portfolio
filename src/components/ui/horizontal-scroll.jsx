import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import cokeSplash from "../../assets/coke-splash.jpg";
import cokeDrink from "../../assets/coke-drink.jpg";

const PANELS = [
  {
    word: "ADVENTURE",
    bg: "bg-red-900",
    image:
      "https://www.coca-cola.com/content/dam/onexp/br/pt/brands/del-valle/brand-update/new/kapo_sabor-imaginacao_desktop_704x528px.jpg/width1960.jpg",
  },
  {
    word: "LUCK",
    bg: "bg-red-800",
    image:
      "https://www.coca-cola.com/content/dam/onexp/br/pt/offerings/fifa-26/matchball/2_fifa_matchball_26_content_card.jpg/width1960.jpg",
  },
  {
    word: "COKE STUDIO",
    bg: "bg-red-600",
    image:
      "https://www.coca-cola.com/content/dam/onexp/br/pt/campaign-cards/coke_studio_card.jpg/width1960.jpg",
  },
  {
    word: "ENERGY",
    bg: "bg-red-400",
    image: cokeSplash,
  },
  {
    word: "DRINK",
    bg: "bg-red-200",
    image:
      cokeDrink,
  },
];

function Panel({ panel, index, progress }) {
  const segment = 1 / PANELS.length;
  // Each word slides across while its own segment of the scroll is active.
  const x = useTransform(progress, [index * segment, (index + 1) * segment], [800, -800]);

  return (
    <li
      className={`${panel.bg} flex h-screen w-screen shrink-0 flex-col items-center justify-center overflow-hidden`}
    >
      <motion.h2
        style={{ x }}
        className="relative bottom-5 inline-block text-[length:20vw]! leading-none! font-semibold text-black"
      >
        {panel.word}
      </motion.h2>
      <img
        src={panel.image}
        alt=""
        width={500}
        height={500}
        className="absolute bottom-0 w-[380px] 2xl:w-[550px]"
      />
    </li>
  );
}

export default function HorizontalScroll() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const translateX = useTransform(progress, [0, 1], ["0vw", `-${PANELS.length - 1}00vw`]);

  return (
    <section ref={sectionRef} className="relative h-[500vh] w-full overflow-x-clip">
      <motion.ul style={{ x: translateX }} className="sticky top-0 flex">
        {PANELS.map((panel, i) => (
          <Panel key={panel.word} panel={panel} index={i} progress={progress} />
        ))}
      </motion.ul>
    </section>
  );
}
