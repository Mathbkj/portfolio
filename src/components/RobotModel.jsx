import { useGLTF } from '@react-three/drei'
import robotModel from '../assets/robot_character.glb'

function RobotModel(props) {
  const { scene } = useGLTF(robotModel)
  const params = new URLSearchParams(window.location.search)
  const only = params.get('only')
  if (params.get('analyze')) {
    scene.traverse((o) => {
      if (o.isMesh && o.name === only) {
        const pos = o.geometry.attributes.position
        for (let i = 0; i < pos.count; i++) {
          const y = pos.getY(i)
          if (y < -0.3) {
            console.log('hand-vertex', pos.getX(i).toFixed(3), y.toFixed(3), pos.getZ(i).toFixed(3))
          }
        }
      }
    })
  }
  scene.traverse((o) => {
    if (o.isMesh && only && o.name !== only) {
      o.visible = false
    }
  })
  return <primitive object={scene} {...props} />
}

export default RobotModel
