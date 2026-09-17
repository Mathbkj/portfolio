import { useState } from "react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

function App() {
  return (
    <ReactLenis root>
      <Navbar />
      <Hero />
      <section className="w-full bg-black py-24" />
    </ReactLenis>
  );
}

export default App;
