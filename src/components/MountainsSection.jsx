import { useEffect, useRef } from "react";
import mountain1 from "../assets/mountain-1.png";
import mountain2 from "../assets/mountain-2.png";
import mountain3 from "../assets/mountain-3.png";
import mountain4 from "../assets/mountain-4.png";

const LAYERS = [
  {
    src: mountain1,
    speed: 0.4,
    baseX: 0,
    className: "pointer-events-none absolute inset-x-0 bottom-0 z-40 h-auto w-full",
  },
  {
    src: mountain4,
    speed: 0.1,
    baseX: -50,
    className: "pointer-events-none absolute top-0 left-1/2 z-0 h-80 w-96",
  },
  {
    src: mountain3,
    speed: 0.15,
    baseX: -50,
    className: "pointer-events-none absolute top-0 left-1/2 z-10 h-auto w-full",
  },
  {
    src: mountain2,
    speed: 0.3,
    baseX: 0,
    className: "pointer-events-none absolute right-24 bottom-5 z-30 w-150 h-80 aspect-square",
  },
];

function MountainsSection() {
  const sectionRef = useRef(null);
  const layerRefs = useRef([]);

  useEffect(() => {
    function handleScroll() {
      const offset = window.scrollY;

      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        const { speed, baseX } = LAYERS[i];
        el.style.transform = `translate3d(${baseX}%, ${offset * speed}px, 0)`;
      });
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-100 min-h-[70vh] w-full  bg-white"
    >
      {LAYERS.map((layer, i) => (
        <img
          key={layer.src}
          ref={(el) => (layerRefs.current[i] = el)}
          src={layer.src}
          alt=""
          aria-hidden="true"
          className={layer.className}
        />
      ))}
    </section>
  );
}

export default MountainsSection;
