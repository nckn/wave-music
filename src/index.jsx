import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { OrbitControls, MeshReflectorMaterial, Grid } from '@react-three/drei'
import ReactDOM from 'react-dom/client'
import WaterScene from './WaterScene'
import * as THREE from 'three'
import { EffectComposer, Bloom, DepthOfField, ToneMapping } from '@react-three/postprocessing'
import './style.css'

const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(
  <div className="App" style={{ width: '100vw', height: '100vh' }}>
    <Canvas
      // camera={{
      //   position: [1, 1, 1],
      //   fov: 75,
      //   near: 0.1,
      //   far: 100
      // }}
      camera={{ position: [-5, 0, 0], fov: 45, near: 1, far: 20 }}
      gl={{ 
        toneMapping: THREE.ACESFilmicToneMapping,
        pixelRatio: Math.min(window.devicePixelRatio, 2)
      }}
    >
      <hemisphereLight intensity={0.15} groundColor="black" />
      <spotLight decay={0} position={[10, 20, 10]} angle={0.12} penumbra={1} intensity={1} castShadow shadow-mapSize={1024} />
      
              <Suspense fallback={null}>
          <group position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
            <WaterScene />
          </group>
        </Suspense>

      <OrbitControls enableDamping zoomSpeed={0.1} />

      {/* <axesHelper args={[5]} /> */}

      {/* Plane reflections + distance blur */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 30]}
          resolution={2048}
          mixBlur={1}
          mixStrength={180}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#202020"
          metalness={0.8}
        />
      </mesh>

      {/* As of three > r154 tonemapping is not applied on rendertargets any longer, it requires a pass */}
      {/* <EffectComposer disableNormalPass multisampling={0}> */}
        {/* <DepthOfField target={[0, 0, 0]} focalLength={0.01} bokehScale={14} height={700} /> */}
        {/* <ToneMapping /> */}
      {/* </EffectComposer> */}
      {/* Postprocessing */}
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0} mipmapBlur luminanceSmoothing={0.0} intensity={5} />
        {/* <DepthOfField target={[0, 0, 13]} focalLength={0.3} bokehScale={15} height={700} /> */}
      </EffectComposer>

    </Canvas>
  </div>
)

// import './style.css'
// import ReactDOM from 'react-dom/client'
// import { Canvas } from '@react-three/fiber'
// import Experience from './Experience.jsx'

// const root = ReactDOM.createRoot(document.querySelector('#root'))

// root.render(
//     <Canvas
//         flat
//         camera={ {
//             fov: 45,
//             near: 0.1,
//             far: 50,
//             position: [ 1, 2, 6 ]
//         } }
//     >
//         <color args={ [ '#030202' ] } attach="background" />
//         <Experience />
//     </Canvas>
// )