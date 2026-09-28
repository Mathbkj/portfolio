import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import Hero from "./components/Hero";
import CloudSection from "./components/CloudSection";
import MyWork from "./components/MyWork";

function App() {
  return (
    <ReactLenis root>
      <Hero />
      <CloudSection />
      <MyWork />
    </ReactLenis>
  );
}

export default App;
