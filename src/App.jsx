import { useState } from "react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MountainsSection from "./components/MountainsSection";

function App() {
  return (
    <ReactLenis root>
      <Navbar />
      <Hero />
      <MountainsSection />
    </ReactLenis>
  );
}

export default App;
