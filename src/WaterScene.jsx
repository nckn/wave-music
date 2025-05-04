import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'

// Import shaders with ?raw suffix to get them as strings
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'

export default function WaterScene() {
  const waterRef = useRef()
  const clockRef = useRef(new THREE.Clock())
  
  // GUI controls with leva
  const { 
    depthColor, 
    surfaceColor,
    bigWavesElevation,
    bigWavesFrequencyX,
    bigWavesFrequencyY,
    bigWavesSpeed,
    smallWavesElevation,
    smallWavesFrequency,
    smallWavesSpeed,
    smallIterations,
    colorOffset,
    colorMultiplier
  } = useControls({
    depthColor: '#ff4000',
    surfaceColor: '#151c37',
    bigWavesElevation: { value: 0.2, min: 0, max: 1, step: 0.001 },
    bigWavesFrequencyX: { value: 4, min: 0, max: 10, step: 0.001 },
    bigWavesFrequencyY: { value: 1.5, min: 0, max: 10, step: 0.001 },
    bigWavesSpeed: { value: 0.75, min: 0, max: 4, step: 0.001 },
    smallWavesElevation: { value: 0.15, min: 0, max: 1, step: 0.001 },
    smallWavesFrequency: { value: 3, min: 0, max: 30, step: 0.001 },
    smallWavesSpeed: { value: 0.2, min: 0, max: 4, step: 0.001 },
    smallIterations: { value: 4, min: 0, max: 5, step: 1 },
    colorOffset: { value: 0.925, min: 0, max: 1, step: 0.001 },
    colorMultiplier: { value: 1, min: 0, max: 10, step: 0.001 }
  })

  // Convert string colors to THREE.Color objects
  const depthColorObj = new THREE.Color(depthColor)
  const surfaceColorObj = new THREE.Color(surfaceColor)

  // Animation frame
  useFrame(() => {
    const elapsedTime = clockRef.current.getElapsedTime()
    
    if (waterRef.current) {
      waterRef.current.material.uniforms.uTime.value = elapsedTime
    }
  })

  return (
    <>
      <OrbitControls enableDamping />
      <mesh 
        ref={waterRef} 
        rotation-x={-Math.PI * 0.5}
      >
        <planeGeometry args={[2, 2, 512, 512]} />
        <shaderMaterial 
          vertexShader={waterVertexShader}
          fragmentShader={waterFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            
            uBigWavesElevation: { value: bigWavesElevation },
            uBigWavesFrequency: { value: new THREE.Vector2(bigWavesFrequencyX, bigWavesFrequencyY) },
            uBigWavesSpeed: { value: bigWavesSpeed },

            uSmallWavesElevation: { value: smallWavesElevation },
            uSmallWavesFrequency: { value: smallWavesFrequency },
            uSmallWavesSpeed: { value: smallWavesSpeed },
            uSmallIterations: { value: smallIterations },

            uDepthColor: { value: depthColorObj },
            uSurfaceColor: { value: surfaceColorObj },
            uColorOffset: { value: colorOffset },
            uColorMultiplier: { value: colorMultiplier }
          }}
        />
      </mesh>
    </>
  )
}