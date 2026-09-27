import AnimatedHeadline from "./AnimatedHeadline";
import CokeCan from "./CokeCan";

// On narrow screens the words leave the sides of the can: "Coca" is centered
// in the free space above it, "Cola" in the space below.
const NARROW_WORD =
  "narrow:m-0 narrow:left-1/2 narrow:right-auto narrow:-translate-x-1/2 narrow:text-center narrow:text-[length:min(25.5vw,calc(var(--can-gap)*0.8))]!";

function Hero({ ready = true }) {
  return (
    <section className="pointer-events-none relative h-svh w-full overflow-hidden">
      <AnimatedHeadline
        text="Coca"
        play={ready}
        className={`absolute top-1/2 left-0 whitespace-nowrap -translate-y-1/2 text-left font-bold text-black! text-[length:min(25.5vw,327.81px)]! narrow:top-[calc(var(--can-gap)/2)] ${NARROW_WORD}`}
      />
      <AnimatedHeadline
        text="Cola"
        play={ready}
        delay={0.3}
        className={`absolute top-1/2 right-10 whitespace-nowrap -translate-y-1/2 text-right font-bold text-black! text-[length:min(25.5vw,327.81px)]! narrow:top-[calc(100%-var(--can-gap)/2)] ${NARROW_WORD}`}
      />
      <CokeCan className="pointer-events-none fixed inset-0 z-10" />
    </section>
  );
}

export default Hero;
