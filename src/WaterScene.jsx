import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useControls, folder } from 'leva'

import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'

export default function WaterScene() {
  const waterRef = useRef()
  const clockRef = useRef(new THREE.Clock())

  // Leva controls with folders for better organization
  const controls = useControls({
    Geometry: folder({
      geometry: { options: ['plane', 'icosphere'] },
      resolution: { value: 512, min: 32, max: 1024, step: 32 },
      sphereRadius: { value: 1, min: 0.5, max: 2, step: 0.1 },
      sphereDetail: { value: 64, min: 1, max: 64, step: 1 },
    }),
    
    Colors: folder({
      depthColor: '#ff4000',
      surfaceColor: '#151c37',
      colorOffset: { value: 0.925, min: 0, max: 1, step: 0.001 },
      colorMultiplier: { value: 1, min: 0, max: 10, step: 0.001 },
    }),
    
    'Big Waves': folder({
      bigWavesElevation: { value: 0.2, min: 0, max: 1, step: 0.001 },
      bigWavesFrequencyX: { value: 4, min: 0, max: 10, step: 0.001 },
      bigWavesFrequencyY: { value: 1.5, min: 0, max: 10, step: 0.001 },
      bigWavesSpeed: { value: 0.75, min: 0, max: 4, step: 0.001 },
    }),
    
    'Small Waves': folder({
      smallWavesElevation: { value: 0.15, min: 0, max: 1, step: 0.001 },
      smallWavesFrequency: { value: 3, min: 0, max: 30, step: 0.001 },
      smallWavesSpeed: { value: 0.2, min: 0, max: 4, step: 0.001 },
      smallIterations: { value: 4, min: 0, max: 5, step: 1 },
    }),
    
    'Depth of Field': folder({
      enableDOF: { value: false }, // Default off
      focalLength: { value: 0.01, min: 0.001, max: 0.1, step: 0.001 },
      bokehScale: { value: 14, min: 1, max: 30, step: 1 },
    }),
  })

  // Create uniforms once
  const uniforms = useRef({
    uTime: { value: 0 },
    uBigWavesElevation: { value: controls.bigWavesElevation },
    uBigWavesFrequency: {
      value: new THREE.Vector2(controls.bigWavesFrequencyX, controls.bigWavesFrequencyY)
    },
    uBigWavesSpeed: { value: controls.bigWavesSpeed },

    uSmallWavesElevation: { value: controls.smallWavesElevation },
    uSmallWavesFrequency: { value: controls.smallWavesFrequency },
    uSmallWavesSpeed: { value: controls.smallWavesSpeed },
    uSmallIterations: { value: controls.smallIterations },

    uDepthColor: { value: new THREE.Color(controls.depthColor) },
    uSurfaceColor: { value: new THREE.Color(controls.surfaceColor) },
    uColorOffset: { value: controls.colorOffset },
    uColorMultiplier: { value: controls.colorMultiplier },
    
    // Add a uniform to tell the shader if we're using a sphere
    uIsSphere: { value: controls.geometry === 'icosphere' ? 1.0 : 0.0 }
  })

  useFrame(() => {
    const elapsedTime = clockRef.current.getElapsedTime()

    uniforms.current.uTime.value = elapsedTime

    // Update geometry type if changed
    uniforms.current.uIsSphere.value = controls.geometry === 'icosphere' ? 1.0 : 0.0

    // Update Leva-controlled uniforms dynamically
    uniforms.current.uBigWavesElevation.value = controls.bigWavesElevation
    uniforms.current.uBigWavesFrequency.value.set(
      controls.bigWavesFrequencyX,
      controls.bigWavesFrequencyY
    )
    uniforms.current.uBigWavesSpeed.value = controls.bigWavesSpeed

    uniforms.current.uSmallWavesElevation.value = controls.smallWavesElevation
    uniforms.current.uSmallWavesFrequency.value = controls.smallWavesFrequency
    uniforms.current.uSmallWavesSpeed.value = controls.smallWavesSpeed
    uniforms.current.uSmallIterations.value = controls.smallIterations

    uniforms.current.uDepthColor.value.set(controls.depthColor)
    uniforms.current.uSurfaceColor.value.set(controls.surfaceColor)
    uniforms.current.uColorOffset.value = controls.colorOffset
    uniforms.current.uColorMultiplier.value = controls.colorMultiplier
  })

  // Function to handle Three.js shader includes
  const onBeforeCompile = (shader) => {
    // Process Three.js built-in include directives
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <tonemapping_fragment>',
      THREE.ShaderChunk.tonemapping_fragment || ''
    )
    
    if (shader.fragmentShader.includes('#include <colorspace_fragment>')) {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <colorspace_fragment>',
        THREE.ShaderChunk.colorspace_fragment || ''
      )
    }
  }

  const isIcosphere = controls.geometry === 'icosphere'

  return (
    <>
      {/* Only add scene lighting when using icosphere */}
      {isIcosphere && (
        <>
          <ambientLight intensity={0.2} />
          <directionalLight position={[1, 1, 1]} intensity={0.5} />
        </>
      )}
      
      <mesh 
        ref={waterRef} 
        rotation-x={isIcosphere ? 0 : -Math.PI * 0.5}
      >
        {isIcosphere ? (
          <icosahedronGeometry args={[controls.sphereRadius, controls.sphereDetail]} />
        ) : (
          <planeGeometry args={[2, 2, controls.resolution, controls.resolution]} />
        )}
        <shaderMaterial
          vertexShader={waterVertexShader}
          fragmentShader={waterFragmentShader}
          uniforms={uniforms.current}
          onBeforeCompile={onBeforeCompile}
        />
      </mesh>
    </>
  )
}