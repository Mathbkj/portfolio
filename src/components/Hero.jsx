import { Suspense } from "react";
import { motion } from "motion/react";
import { Scene } from "./Scene";

function Hero() {
  return (
    <section className="relative flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden px-6 py-16 md:flex-row">
      <motion.h1
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute top-8 left-6 z-30 max-w-md text-4xl font-bold md:text-5xl"
      >
        Creating the best experiences
      </motion.h1>
      <Suspense fallback={null}>
        <div className="flex h-175 w-full max-w-lg items-center justify-center">
          <Scene />
        </div>
      </Suspense>
      <div className="absolute top-1/2 right-6 z-30 max-w-md -translate-y-1/2">
        <motion.h1
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl font-bold md:text-5xl"
        >
          And shaping your ideas
        </motion.h1>
      </div>
      <motion.h1
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute bottom-60 left-20 z-30 max-w-md text-4xl font-bold md:text-5xl"
      >
        Into reality
      </motion.h1>
    </section>
  );
}

export default Hero;
