import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Environment, Lightformer, useGLTF } from "@react-three/drei";
import { MathUtils } from "three";
import cokeUrl from "../assets/coke_zero/scene.gltf?url";

function Model() {
  const { scene } = useGLTF(cokeUrl);

  const group = useRef();

  useFrame((_, delta) => {
    const progress = MathUtils.clamp(window.scrollY / window.innerHeight, 0, 1);
    const g = group.current;
    // tumbles end over end like falling, half turn on Y shows both sides
    g.rotation.x = MathUtils.damp(g.rotation.x, progress * Math.PI * 2, 6, delta);
    // after showcase, keeps spinning sideways (Y axis) while scrolling through the cloud section
    const cloud = document.getElementById("cloud-section");
    const cloudProgress = cloud
      ? Math.max(1 - cloud.getBoundingClientRect().top / window.innerHeight, 0)
      : 0;
    const spin = -0.61 + progress * Math.PI + cloudProgress * Math.PI * 2;
    g.rotation.y = MathUtils.damp(g.rotation.y, spin, 6, delta);
    g.rotation.z = MathUtils.damp(g.rotation.z, Math.sin(progress * Math.PI) * 0.35, 6, delta);
  });

  return (
    <group ref={group} rotation={[0, -0.61, 0]}>
      <Center>
        {/* node matrices scale model by 100 */}
        <primitive object={scene} scale={0.008} />
      </Center>
    </group>
  );
}

function CokeCan({ className = "" }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 8], fov: 35 }} dpr={[1, 2]} gl={{ alpha: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={2} />
        <Environment resolution={256}>
          <Lightformer intensity={3} position={[0, 5, -5]} scale={[10, 4, 1]} />
          <Lightformer intensity={2} position={[-5, 0, 3]} scale={[4, 8, 1]} />
          <Lightformer intensity={2} position={[5, 0, 3]} scale={[4, 8, 1]} />
        </Environment>
        <Model />
      </Canvas>
    </div>
  );
}

export default CokeCan;
