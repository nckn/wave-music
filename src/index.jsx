import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import WaterScene from './WaterScene'
import * as THREE from 'three'
import { EffectComposer, DepthOfField, ToneMapping } from '@react-three/postprocessing'
import './style.css'

const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(
  <div className="App" style={{ width: '100vw', height: '100vh' }}>
    <Canvas
      camera={{
        position: [1, 1, 1],
        fov: 75,
        near: 0.1,
        far: 100
      }}
      gl={{ 
        toneMapping: THREE.ACESFilmicToneMapping,
        pixelRatio: Math.min(window.devicePixelRatio, 2)
      }}
    >
      <Suspense fallback={null}>
        <WaterScene />
      </Suspense>

      {/* As of three > r154 tonemapping is not applied on rendertargets any longer, it requires a pass */}
      <EffectComposer disableNormalPass multisampling={0}>
        <DepthOfField target={[0, 0, 60]} focalLength={0.2} bokehScale={14} height={700} />
        {/* <ToneMapping /> */}
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