import AnimatedHeadline from "./AnimatedHeadline";
import CokeCan from "./CokeCan";

function Hero() {
  return (
    <section className="pointer-events-none relative h-svh w-full overflow-hidden">
      <AnimatedHeadline
        text="Coca"
        className="absolute top-1/2 left-0 whitespace-nowrap -translate-y-1/2 text-left font-bold text-black! text-[length:min(25.5vw,327.81px)]!"
      />
      <AnimatedHeadline
        text="Cola"
        delay={0.3}
        className="absolute top-1/2 right-10 whitespace-nowrap -translate-y-1/2 text-right font-bold text-black! text-[length:min(25.5vw,327.81px)]!"
      />
      <CokeCan className="pointer-events-none fixed inset-0 z-10" />
    </section>
  );
}

export default Hero;
