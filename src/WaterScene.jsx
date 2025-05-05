import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'

import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'

export default function WaterScene() {
  const waterRef = useRef()
  const clockRef = useRef(new THREE.Clock())

  // Leva controls
  const controls = useControls({
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
    uColorMultiplier: { value: controls.colorMultiplier }
  })

  useFrame(() => {
    const elapsedTime = clockRef.current.getElapsedTime()

    uniforms.current.uTime.value = elapsedTime

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

  return (
    <>
      <OrbitControls enableDamping />
      <mesh ref={waterRef} rotation-x={-Math.PI * 0.5}>
        <planeGeometry args={[2, 2, 512, 512]} />
        <shaderMaterial
          vertexShader={waterVertexShader}
          fragmentShader={waterFragmentShader}
          uniforms={uniforms.current}
        />
      </mesh>
    </>
  )
}
