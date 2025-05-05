import { useRef, useEffect } from 'react' // Import useEffect
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'

import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'

export default function WaterScene() {
    const waterRef = useRef();
    const clockRef = useRef(new THREE.Clock());

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
    });

    // Use useRef to store color objects to avoid recreating them on every frame
    const depthColorObj = useRef(new THREE.Color(depthColor));
    const surfaceColorObj = useRef(new THREE.Color(surfaceColor));

    // Update uniforms when Leva values change
    useEffect(() => {
        if (waterRef.current) {
            waterRef.current.material.uniforms.uBigWavesElevation.value = bigWavesElevation;
            waterRef.current.material.uniforms.uBigWavesFrequency.value.set(bigWavesFrequencyX, bigWavesFrequencyY);
            waterRef.current.material.uniforms.uBigWavesSpeed.value = bigWavesSpeed;
            waterRef.current.material.uniforms.uSmallWavesElevation.value = smallWavesElevation;
            waterRef.current.material.uniforms.uSmallWavesFrequency.value = smallWavesFrequency;
            waterRef.current.material.uniforms.uSmallWavesSpeed.value = smallWavesSpeed;
            waterRef.current.material.uniforms.uSmallIterations.value = smallIterations;
            waterRef.current.material.uniforms.uColorOffset.value = colorOffset;
            waterRef.current.material.uniforms.uColorMultiplier.value = colorMultiplier;

            // Update colors
            depthColorObj.current.set(depthColor);
            surfaceColorObj.current.set(surfaceColor);
            waterRef.current.material.uniforms.uDepthColor.value = depthColorObj.current;
            waterRef.current.material.uniforms.uSurfaceColor.value = surfaceColorObj.current;
        }
    }, [
        bigWavesElevation, bigWavesFrequencyX, bigWavesFrequencyY, bigWavesSpeed,
        smallWavesElevation, smallWavesFrequency, smallWavesSpeed, smallIterations,
        colorOffset, colorMultiplier, depthColor, surfaceColor
    ]);


    useFrame(() => {
        const elapsedTime = clockRef.current.getElapsedTime();
        if (waterRef.current) {
            waterRef.current.material.uniforms.uTime.value = elapsedTime;
        }
    });

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
                        uDepthColor: { value: depthColorObj.current },
                        uSurfaceColor: { value: surfaceColorObj.current },
                        uColorOffset: { value: colorOffset },
                        uColorMultiplier: { value: colorMultiplier }
                    }}
                />
            </mesh>
        </>
    );
}