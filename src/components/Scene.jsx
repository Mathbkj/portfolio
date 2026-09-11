import { Canvas } from '@react-three/fiber'

function Scene() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} />
      <mesh>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="#722f99" />
      </mesh>
    </Canvas>
  )
}

export default Scene
