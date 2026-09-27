import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useProgress } from "@react-three/drei";
import { useLenis } from "lenis/react";

// Short hold after the assets finish, so the first frame of the scene is on
// screen before the overlay lifts.
const EXIT_DELAY = 400;

// Full-screen overlay shown while the 3D scene (model + textures) loads.
// Tracks three's default loading manager, so it covers every asset the
// canvas requests, and keeps the page from scrolling until it is done.
function Loader({ onDone }) {
  const { active, progress } = useProgress();
  const lenis = useLenis();
  const [visible, setVisible] = useState(true);
  const loaded = !active && progress === 100;

  useEffect(() => {
    if (!loaded) return;
    const id = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, EXIT_DELAY);
    return () => clearTimeout(id);
  }, [loaded, onDone]);

  useEffect(() => {
    if (!lenis) return;
    if (visible) lenis.stop();
    else lenis.start();
  }, [lenis, visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-label={`Loading ${Math.round(progress)}%`}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-heading text-[length:min(12vw,6rem)] leading-none text-black">
            {Math.round(progress)}%
          </span>
          <div className="h-1 w-[min(60vw,20rem)] overflow-hidden rounded-full bg-accent-bg">
            <motion.div
              className="h-full origin-left bg-accent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Loader;
