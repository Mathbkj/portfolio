import { useState } from "react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import Hero from "./components/Hero";
import Showcase from "./components/Showcase";
import CloudSection from "./components/CloudSection";

function App() {
  return (
    <ReactLenis root>
      <Hero />
      <Showcase />
      <CloudSection />
    </ReactLenis>
  );
}

export default App;
