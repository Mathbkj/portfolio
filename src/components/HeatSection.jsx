import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, useInView, useMotionValueEvent, useScroll } from "motion/react";
import { MathUtils } from "three";
import { HEAT_SECTION_ID, IRONBOW_GLSL, isHeatActive } from "./heatVision";

// Page background (--bg) as raw sRGB, shown before heat vision switches on.
const BASE_COLOR = [1.0, 0.973, 1.0];
// How fast heat vision fades in and out (MathUtils.damp lambda).
const ACTIVATE_SPEED = 2.5;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Outputs sRGB directly: no colorspace/tonemapping chunks are included, so
// three leaves the colors untouched.
const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uActive;
  uniform vec2 uResolution;
  uniform vec3 uBase;
  varying vec2 vUv;

  ${IRONBOW_GLSL}

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 centered = (vUv - 0.5) * vec2(aspect, 1.0);

    // Heat shimmer: rows wobble sideways, and the field drifts upward.
    vec2 p = centered;
    p.x += sin(p.y * 38.0 + uTime * 3.0) * 0.004;
    float field = fbm(p * 2.6 + vec2(0.0, -uTime * 0.12));
    float heat = 0.3 + field * 0.5 + (1.0 - vUv.y) * 0.18;

    // The ice-cold can chills the air right around it.
    heat -= smoothstep(0.55, 0.0, length(centered * vec2(1.5, 0.8))) * 0.22;

    vec3 thermal = ironbow(heat);
    // Sensor scanlines and a little grain.
    thermal *= 0.93 + 0.07 * sin(vUv.y * uResolution.y * 1.4);
    thermal += (hash(vUv * uResolution + uTime) - 0.5) * 0.04;

    // Switches on as a circle growing out from the can at the center.
    float radius = uActive * (length(vec2(aspect, 1.0)) * 0.5 + 0.2);
    float d = length(centered);
    float edge = smoothstep(radius - 0.12, radius, d);
    vec3 color = mix(thermal, uBase, edge);
    // Bright band on the growing circle's edge while it is switching on.
    float rim = smoothstep(radius - 0.12, radius - 0.06, d) - smoothstep(radius - 0.06, radius, d);
    color = mix(color, ironbow(0.9), rim * (1.0 - uActive));

    gl_FragColor = vec4(color, 1.0);
  }
`;

function HeatField() {
  const material = useRef();
  const active = useRef(0);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uActive: { value: 0 },
      uResolution: { value: [1, 1] },
      uBase: { value: BASE_COLOR },
    }),
    []
  );

  useFrame(({ clock, size }, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    active.current = MathUtils.damp(active.current, isHeatActive() ? 1 : 0, ACTIVATE_SPEED, delta);
    u.uActive.value = active.current;
    u.uTime.value = clock.elapsedTime;
    u.uResolution.value = [size.width, size.height];
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

// Target box drawn around the can, sized from --can-unit (index.css), the
// can's on-screen scale: the can is ~0.32 of it wide and ~0.74 tall, centered.
// The box leaves a bit more room above the can than below, and keeps a px
// minimum from the edges (--hud-clear-*, index.css) so it stays clear of the
// HUD readout and palette scale, which sit a fixed number of px from the edges.
const BOX_TOP = "max(calc(50vh - 0.42 * var(--can-unit)), var(--hud-clear-top))";
const BOX_BOTTOM = "max(calc(50vh - 0.4 * var(--can-unit)), var(--hud-clear-bottom))";
// An <svg> is a replaced element, so top + bottom alone won't stretch it; the
// height is set explicitly.
const TARGET_BOX = {
  width: "calc(0.4 * var(--can-unit))",
  top: BOX_TOP,
  height: `calc(100vh - ${BOX_TOP} - ${BOX_BOTTOM})`,
};

function TargetBox({ on }) {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // In px so the stroke never stretches; starts at the top center and runs
  // clockwise back to it.
  const { width: w, height: h } = size;
  const path = `M ${w / 2} 1 H ${w - 1} V ${h - 1} H 1 V 1 Z`;

  return (
    <svg
      ref={ref}
      // fixed like the can's canvas, so it frames the can even while the
      // section is still scrolling in
      className="fixed left-1/2 -translate-x-1/2 overflow-visible"
      style={TARGET_BOX}
      viewBox={`0 0 ${w || 1} ${h || 1}`}
      fill="none"
    >
      <motion.path
        d={path}
        stroke="white"
        strokeWidth={2}
        initial={false}
        animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
        transition={{
          pathLength: { duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: on ? 0.3 : 0 },
          opacity: { duration: 0.2, delay: on ? 0.3 : 0.6 },
        }}
      />
    </svg>
  );
}

// Thermal-camera overlay: frame corners, crosshair on the can, a readout and
// the palette scale. Fades in with the shaders.
function Hud({ on }) {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 z-20 font-mono text-xs tracking-widest text-white uppercase md:text-sm"
      initial={false}
      animate={{ opacity: on ? 1 : 0 }}
      transition={{ duration: 0.6, delay: on ? 0.5 : 0 }}
    >
      <div className="absolute inset-4 md:inset-8">
        <span className="absolute top-0 left-0 size-6 border-t-2 border-l-2 border-white/80" />
        <span className="absolute top-0 right-0 size-6 border-t-2 border-r-2 border-white/80" />
        <span className="absolute bottom-0 left-0 size-6 border-b-2 border-l-2 border-white/80" />
        <span className="absolute right-0 bottom-0 size-6 border-r-2 border-b-2 border-white/80" />

        <div className="absolute top-4 left-6 flex items-center gap-2 text-left">
          <span className="size-2 animate-pulse rounded-full bg-red-500" />
          Thermal · Rec
        </div>
        <div className="absolute top-4 right-6 text-right">
          <div className="text-white/70">Can</div>
          <div className="font-heading text-3xl tracking-normal md:text-5xl">-2.0°C</div>
        </div>

        {/* on short screens it moves to the corner, clear of the can */}
        <div className="absolute bottom-4 left-1/2 flex w-[min(70vw,24rem)] -translate-x-1/2 flex-col gap-1 short:left-6 short:w-[min(25vw,12rem)] short:translate-x-0">
          <div
            className="h-2 w-full"
            style={{
              background:
                "linear-gradient(90deg, #000005, #1a0561, #850594, #e6291f, #ff9905, #fffac7)",
            }}
          />
          <div className="flex justify-between text-white/80">
            <span>-5°C</span>
            <span>40°C</span>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 size-10 -translate-1/2">
        <span className="absolute top-1/2 left-0 h-px w-full bg-white/80" />
        <span className="absolute top-0 left-1/2 h-full w-px bg-white/80" />
      </div>
    </motion.div>
  );
}

function HeatSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "200px 0px" });
  const [on, setOn] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", () => setOn(isHeatActive()));

  return (
    <section ref={ref} id={HEAT_SECTION_ID} className="pointer-events-none relative h-[250svh] w-full">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* only animates while the section is near the viewport */}
        <Canvas
          className="absolute! inset-0"
          dpr={[1, 1.5]}
          frameloop={inView ? "always" : "never"}
          gl={{ antialias: false }}
        >
          <HeatField />
        </Canvas>
        <Hud on={on} />
        <TargetBox on={on} />
      </div>
    </section>
  );
}

export default HeatSection;
