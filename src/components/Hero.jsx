import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import RobotModel from './RobotModel'

function Hero() {
  return (
    <section className="flex min-h-[80vh] w-full flex-col items-center justify-center px-6 py-16">
      <div className="h-[80vh] w-full">
        <Canvas camera={{ position: [0, 1, 2], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 3, 3]} intensity={1} />
          <Suspense fallback={null}>
            <RobotModel scale={1} position={[0, -1, 0]} rotation={[0, Math.PI / 2, 0]} />
            <Environment preset="city" />
          </Suspense>
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>
    </section>
  )
}

export default Hero
