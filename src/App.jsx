import { useRef } from "react";
import { useScroll } from "motion/react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import Hero from "./components/Hero";
import Showcase from "./components/Showcase";
import Closing from "./components/Closing";
import Finale from "./components/Finale";
import Scene from "./components/Scene";

function App() {
  const introRef = useRef(null);
  const closingRef = useRef(null);
  const finaleRef = useRef(null);
  // 0 at the top of the Hero, 1 once the Showcase section is centered in the viewport.
  const { scrollYProgress: introProgress } = useScroll({
    target: introRef,
    offset: ["start start", "end end"],
  });
  // 0 when the Closing section starts entering, 1 once it fills the viewport.
  const { scrollYProgress: exitProgress } = useScroll({
    target: closingRef,
    offset: ["start end", "start start"],
  });

  // 0 when the Finale section starts entering, 1 once it fills the viewport.
  const { scrollYProgress: standProgress } = useScroll({
    target: finaleRef,
    offset: ["start end", "start start"],
  });

  return (
    <ReactLenis root>
      <div className="relative bg-bg">
        <div className="sticky top-0 z-10 h-svh w-full overflow-hidden">
          <Scene
            introProgress={introProgress}
            exitProgress={exitProgress}
            standProgress={standProgress}
          />
        </div>
        <div className="relative z-20 mt-[-100svh]">
          <div ref={introRef}>
            <Hero />
            <Showcase />
          </div>
          <div ref={closingRef}>
            <Closing />
          </div>
          <div ref={finaleRef}>
            <Finale />
          </div>
        </div>
      </div>
    </ReactLenis>
  );
}

export default App;
