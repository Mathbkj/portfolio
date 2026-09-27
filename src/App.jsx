import { useCallback, useState } from "react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import HeatSection from "./components/HeatSection";
import Hero from "./components/Hero";
import Loader from "./components/Loader";
import Showcase from "./components/Showcase";
import WindSection from "./components/WindSection";

function App() {
  const [ready, setReady] = useState(false);
  const handleLoaded = useCallback(() => setReady(true), []);

  return (
    <ReactLenis root>
      <Loader onDone={handleLoaded} />
      <Hero ready={ready} />
      <Showcase />
      <WindSection />
      <HeatSection />
    </ReactLenis>
  );
}

export default App;
