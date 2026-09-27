import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, Environment, Lightformer, useGLTF } from "@react-three/drei";
import {
  Box3,
  CanvasTexture,
  HalfFloatType,
  MathUtils,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderTarget,
} from "three";
import cokeUrl from "../assets/coke_zero/scene.gltf?url";
import { IRONBOW_GLSL, isHeatActive } from "./heatVision";

const MODEL_SCALE = 0.008;
const LABEL_TEXT = "ZERO SUGAR";
const LABEL_FONT = '"Bebas Neue", sans-serif';
// Label height, and its vertical offset from the can center, as fractions of
// the can height.
const LABEL_HEIGHT = 0.18;
const LABEL_Y = 0;
// Gap between the can surface and the label, as a fraction of the can radius,
// so the text floats around the can like a ring.
const LABEL_OFFSET = 0.25;
// Entrance: shown once the wind section is this far into view (1 = its top
// reached the top of the viewport). While entering, the label starts lower
// (fraction of can height) and a sweep (rad) behind, easing into place.
const LABEL_REVEAL_AT = 0.5;
const LABEL_REVEAL_SPEED = 3;
const LABEL_RISE = 0.08;
const LABEL_SWEEP = 1.2;

// Paints the label into a canvas once the web font is ready, so the texture
// uses Bebas Neue instead of the fallback font.
function useLabelTexture(text) {
  const [label, setLabel] = useState(null);

  useEffect(() => {
    let texture;
    let cancelled = false;
    const fontPx = 256;
    const font = `${fontPx}px ${LABEL_FONT}`;

    document.fonts.load(font).then(() => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.font = font;
      const padding = fontPx * 0.15;
      canvas.width = Math.ceil(ctx.measureText(text).width + padding * 2);
      canvas.height = Math.ceil(fontPx * 1.1);
      // resizing the canvas resets the context state
      ctx.font = font;
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#e7223a";
      ctx.fillText(text, padding, canvas.height / 2 + fontPx * 0.04);

      texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = 8;
      setLabel({ texture, aspect: canvas.width / canvas.height });
    });

    return () => {
      cancelled = true;
      texture?.dispose();
    };
  }, [text]);

  return label;
}

// How far the wind section has scrolled into view: 0 while it is below the
// viewport, 1 once its top reaches the top of the viewport, and beyond after.
function getWindProgress() {
  const wind = document.getElementById("wind-section");
  return wind ? Math.max(1 - wind.getBoundingClientRect().top / window.innerHeight, 0) : 0;
}

// True once the can (fixed at the viewport center) has scrolled past the end of
// the wind section.
function hasLeftWindSection() {
  const wind = document.getElementById("wind-section");
  return wind ? wind.getBoundingClientRect().bottom <= window.innerHeight / 2 : false;
}

// Text wrapped around the can: an open cylinder slice whose arc length matches
// the label's aspect ratio, so the letters keep their proportions while curving.
// It only shows while the can is in the wind section: it fades in while rising
// and sweeping around the can into place, and plays that in reverse once the
// can leaves the section in either direction.
function CurvedLabel({ radius, height, facing }) {
  const label = useLabelTexture(LABEL_TEXT);
  const mesh = useRef();
  const material = useRef();
  const reveal = useRef(0);

  useFrame((_, delta) => {
    if (!mesh.current || !material.current) return;
    const inWind = getWindProgress() >= LABEL_REVEAL_AT && !hasLeftWindSection();
    const target = inWind ? 1 : 0;
    reveal.current = MathUtils.damp(reveal.current, target, LABEL_REVEAL_SPEED, delta);
    const t = reveal.current;
    material.current.opacity = t;
    mesh.current.visible = t > 0.001;
    mesh.current.position.y = height * (LABEL_Y - LABEL_RISE * (1 - t));
    mesh.current.rotation.y = -LABEL_SWEEP * (1 - t);
  });

  if (!label) return null;

  const r = radius * (1 + LABEL_OFFSET);
  const h = height * LABEL_HEIGHT;
  const arc = Math.min((h * label.aspect) / r, Math.PI * 2);

  return (
    <mesh ref={mesh} position-y={height * (LABEL_Y - LABEL_RISE)} visible={false}>
      <cylinderGeometry args={[r, r, h, 96, 1, true, facing - arc / 2, arc]} />
      <meshStandardMaterial
        ref={material}
        map={label.texture}
        transparent
        opacity={0}
        roughness={0.35}
        metalness={0.1}
        depthWrite={false}
      />
    </mesh>
  );
}

function Model() {
  const { scene } = useGLTF(cokeUrl);

  // Measure the model unparented so the box is in its own space, then scale.
  const size = useMemo(() => {
    const probe = scene.clone();
    probe.position.set(0, 0, 0);
    probe.rotation.set(0, 0, 0);
    probe.scale.set(1, 1, 1);
    probe.updateMatrixWorld(true);
    return new Box3().setFromObject(probe).getSize(new Vector3()).multiplyScalar(MODEL_SCALE);
  }, [scene]);

  const group = useRef();

  useFrame((_, delta) => {
    const progress = MathUtils.clamp(window.scrollY / window.innerHeight, 0, 1);
    const g = group.current;
    // tumbles end over end like falling, half turn on Y shows both sides
    g.rotation.x = MathUtils.damp(g.rotation.x, progress * Math.PI * 2, 6, delta);
    // after showcase, keeps spinning sideways (Y axis) while scrolling through the wind section
    const spin = -0.61 + progress * Math.PI + getWindProgress() * Math.PI * 2;
    g.rotation.y = MathUtils.damp(g.rotation.y, spin, 6, delta);
    g.rotation.z = MathUtils.damp(g.rotation.z, Math.sin(progress * Math.PI) * 0.35, 6, delta);
  });

  return (
    <group ref={group} rotation={[0, -0.61, 0]}>
      <Center>
        {/* node matrices scale model by 100 */}
        <primitive object={scene} scale={MODEL_SCALE} />
      </Center>
      {/* sits in the same group as the can, so it orbits with every rotation;
          centered at +0.61 rad to face the camera against the group's -0.61 start */}
      <CurvedLabel radius={Math.max(size.x, size.z) / 2} height={size.y} facing={0.61} />
    </group>
  );
}

// How fast heat vision fades in and out (MathUtils.damp lambda); matches the
// heat section background.
const HEAT_SPEED = 2.5;

const thermalVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// The scene texture is linear and premultiplied (rendering into a target skips
// tone mapping and sRGB output), so the normal view redoes both here. The
// thermal view maps brightness onto the cold end of the palette: the ice-cold
// can reads blue/purple against the warm heat section behind it.
const thermalFragmentShader = /* glsl */ `
  uniform sampler2D tScene;
  uniform float uHeat;
  varying vec2 vUv;

  ${IRONBOW_GLSL}

  void main() {
    vec4 src = texture2D(tScene, vUv);
    vec3 linear = src.rgb / max(src.a, 1e-4);
    #ifdef TONE_MAPPING
      linear = toneMapping(linear);
    #endif
    vec3 normal = linearToOutputTexel(vec4(linear, 1.0)).rgb;

    float lum = dot(normal, vec3(0.2126, 0.7152, 0.0722));
    vec3 thermal = ironbow(0.06 + lum * 0.42);

    vec3 color = mix(normal, thermal, uHeat);
    gl_FragColor = vec4(color * src.a, src.a);
  }
`;

// Takes over rendering (priority 1). Outside the heat section it renders the
// scene as usual; inside, it renders into a target and draws it through the
// thermal shader.
function ThermalPass() {
  const { gl, scene, camera } = useThree();
  const heat = useRef(0);
  const passRef = useRef(null);

  useEffect(() => {
    const target = new WebGLRenderTarget(1, 1, { samples: 4, type: HalfFloatType });
    const material = new ShaderMaterial({
      uniforms: { tScene: { value: target.texture }, uHeat: { value: 0 } },
      vertexShader: thermalVertexShader,
      fragmentShader: thermalFragmentShader,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new Mesh(new PlaneGeometry(2, 2), material);
    quad.frustumCulled = false;
    const quadScene = new Scene();
    quadScene.add(quad);
    passRef.current = { target, material, quadScene, quadCamera: new OrthographicCamera() };

    return () => {
      passRef.current = null;
      target.dispose();
      material.dispose();
      quad.geometry.dispose();
    };
  }, []);

  useFrame((_, delta) => {
    heat.current = MathUtils.damp(heat.current, isHeatActive() ? 1 : 0, HEAT_SPEED, delta);
    const pass = passRef.current;

    if (!pass || heat.current < 0.001) {
      gl.setRenderTarget(null);
      gl.render(scene, camera);
      return;
    }

    const { width, height } = gl.domElement;
    if (pass.target.width !== width || pass.target.height !== height) {
      pass.target.setSize(width, height);
    }
    gl.setRenderTarget(pass.target);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    pass.material.uniforms.uHeat.value = heat.current;
    gl.render(pass.quadScene, pass.quadCamera);
  }, 1);

  return null;
}

const CAMERA_Z = 8;
// Narrower than this, the camera pulls back so the can shrinks with the width
// instead of keeping its height. Keep in sync with --can-unit in index.css.
const CAN_MIN_ASPECT = 0.9;

function ResponsiveCamera() {
  useFrame(({ camera, size }) => {
    const z = CAMERA_Z * Math.max(1, CAN_MIN_ASPECT / (size.width / size.height));
    if (camera.position.z !== z) camera.position.z = z;
  });
  return null;
}

function CokeCan({ className = "" }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, CAMERA_Z], fov: 35 }} dpr={[1, 2]} gl={{ alpha: true }}>
        <ResponsiveCamera />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={2} />
        <Environment resolution={256}>
          <Lightformer intensity={3} position={[0, 5, -5]} scale={[10, 4, 1]} />
          <Lightformer intensity={2} position={[-5, 0, 3]} scale={[4, 8, 1]} />
          <Lightformer intensity={2} position={[5, 0, 3]} scale={[4, 8, 1]} />
        </Environment>
        <Model />
        <ThermalPass />
      </Canvas>
    </div>
  );
}

export default CokeCan;
