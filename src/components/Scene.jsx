import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";

const MODEL_URL = "/models/coke-zero/scene.gltf";
// Source model's bounding box is ~370x505x345 units (Sketchfab export scale);
// normalize it down so the can reads at a sensible size in the scene.
const MODEL_SCALE = 0.005;
// Camera pulls back on narrow (portrait) viewports so the can is never cropped.
const BASE_DISTANCE = 4;
const MIN_ASPECT = 0.6;
// Intro spin around the can's own axis; 1.5 turns lands on the opposite side first.
const SPIN_TURNS = 1.5;
const SPIN_DURATION = 2.4;
// Roll around the depth (Z) axis while scrolling from Hero to the next section.
// The base tilt is +0.5 rad (leaning left); stopping 1 rad short of a full turn
// leaves the can at -0.5 rad, mirrored and leaning right.
const SCROLL_ROLL = Math.PI * 2 - 1;
// After the Showcase the can drifts down (as a fraction of the visible half-height),
// shrinks a little and rolls one more full turn around Z, landing on the same pose.
const EXIT_DROP = 0.4;
const EXIT_SCALE = 0.7;
const EXIT_ROLL = Math.PI * 2;
// Last step: the can stands straight (90deg to the floor). The base tilt is
// +0.5 rad on Z and +0.35 rad on X; the roll adds the 0.5 rad missing to
// cancel the Z lean, and the X tilt is flattened to 0.
const BASE_TILT_X = 0.35;
const BASE_TILT_Z = 0.5;
const STAND_ROLL = 0.5;

function CokeZeroModel({ introProgress, exitProgress, standProgress }) {
  const { scene } = useGLTF(MODEL_URL);
  const spinRef = useRef(null);
  const rollRef = useRef(null);
  const moveRef = useRef(null);
  const tiltRef = useRef(null);
  const startTime = useRef(null);

  useFrame(({ clock, camera }) => {
    if (!spinRef.current) return;
    if (startTime.current === null) startTime.current = clock.elapsedTime;
    const t = Math.min((clock.elapsedTime - startTime.current) / SPIN_DURATION, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    spinRef.current.rotation.y = SPIN_TURNS * Math.PI * 2 * (1 - eased);
    const intro = introProgress?.get() ?? 0;
    const exit = exitProgress?.get() ?? 0;
    const stand = standProgress?.get() ?? 0;
    if (rollRef.current) {
      rollRef.current.rotation.z = intro * SCROLL_ROLL + exit * EXIT_ROLL + stand * STAND_ROLL;
    }
    if (tiltRef.current) {
      tiltRef.current.rotation.x = BASE_TILT_X * (1 - stand);
    }
    if (moveRef.current) {
      const halfHeight = camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
      moveRef.current.position.y = -exit * EXIT_DROP * halfHeight;
      moveRef.current.scale.setScalar(1 - exit * (1 - EXIT_SCALE));
    }
  });

  return (
    <group ref={moveRef}>
    <group ref={rollRef}>
      <Center>
        <group ref={tiltRef} rotation={[BASE_TILT_X, 0, BASE_TILT_Z]}>
          <group ref={spinRef} rotation={[0, SPIN_TURNS * Math.PI * 2, 0]}>
            <primitive object={scene} scale={MODEL_SCALE} />
          </group>
        </group>
      </Center>
    </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);

function ResponsiveCamera() {
  const aspect = useThree((state) => state.size.width / state.size.height);
  const distance = BASE_DISTANCE * Math.max(1, MIN_ASPECT / aspect);

  return <PerspectiveCamera makeDefault position={[0, 0, distance]} fov={45} />;
}

function Scene({ introProgress, exitProgress, standProgress }) {
  return (
    <Canvas camera={{ position: [0, 0, BASE_DISTANCE], fov: 45 }} gl={{ alpha: true }}>
      <ResponsiveCamera />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 4, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-4, -2, -3]} intensity={0.8} color="#e7223a" />

      <Suspense fallback={null}>
        <CokeZeroModel
          introProgress={introProgress}
          exitProgress={exitProgress}
          standProgress={standProgress}
        />
      </Suspense>

      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}

export default Scene;
