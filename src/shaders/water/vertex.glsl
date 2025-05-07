uniform float uTime;
uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uBigWavesSpeed;
uniform float uSmallWavesElevation;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesSpeed;
uniform float uSmallIterations;
uniform float uIsSphere;  // 1.0 for sphere, 0.0 for plane

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/perlinClassic3D.glsl

float waveElevation(vec3 position)
{
    float elevation = sin(position.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) *
                      sin(position.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) *
                      uBigWavesElevation;

    for(float i = 1.0; i <= uSmallIterations; i++)
    {
        if (uIsSphere > 0.5) {
            // For sphere, use full 3D position
            elevation -= abs(perlinClassic3D(vec3(
                position * uSmallWavesFrequency * i + uTime * uSmallWavesSpeed
            )) * uSmallWavesElevation / i);
        } else {
            // For plane, use original xz mapping
            elevation -= abs(perlinClassic3D(vec3(
                position.xz * uSmallWavesFrequency * i, uTime * uSmallWavesSpeed
            )) * uSmallWavesElevation / i);
        }
    }

    return elevation;
}

void main()
{
    // Base position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    float elevation = 0.0;
    vec3 computedNormal;
    
    if (uIsSphere > 0.5) {
        // SPHERE MODE
        // Get the normalized direction from center to position (sphere normal)
        vec3 sphereNormal = normalize(position);
        
        // Calculate elevation based on the normalized position
        elevation = waveElevation(sphereNormal);
        
        // Displace along the normal direction
        modelPosition.xyz += sphereNormal * elevation;
        
        // For normal calculation on sphere
        float shift = 0.01;
        // Create tangent and bitangent for our sphere
        vec3 tangent = normalize(cross(sphereNormal, vec3(0.0, 1.0, 0.0)));
        if (length(tangent) < 0.1) {
            tangent = normalize(cross(sphereNormal, vec3(1.0, 0.0, 0.0)));
        }
        vec3 bitangent = normalize(cross(sphereNormal, tangent));
        
        // Calculate positions with small offsets along tangent and bitangent
        vec3 posA = position + tangent * shift;
        vec3 posB = position + bitangent * shift;
        
        // Get normals for offset positions
        vec3 normalA = normalize(posA);
        vec3 normalB = normalize(posB);
        
        // Calculate elevations at offset positions
        float elevA = waveElevation(normalA);
        float elevB = waveElevation(normalB);
        
        // Calculate displaced positions
        vec3 displacedA = posA + normalA * elevA;
        vec3 displacedB = posB + normalB * elevB;
        
        // Calculate new normal using cross product
        vec3 toA = normalize(displacedA - (position + sphereNormal * elevation));
        vec3 toB = normalize(displacedB - (position + sphereNormal * elevation));
        computedNormal = normalize(cross(toA, toB));
    } 
    else {
        // PLANE MODE (original code)
        float shift = 0.01;
        vec3 modelPositionA = modelPosition.xyz + vec3(shift, 0.0, 0.0);
        vec3 modelPositionB = modelPosition.xyz + vec3(0.0, 0.0, -shift);
        
        // Calculate elevations
        elevation = waveElevation(modelPosition.xyz);
        float elevationA = waveElevation(modelPositionA);
        float elevationB = waveElevation(modelPositionB);
        
        // Apply elevation to Y coordinate
        modelPosition.y += elevation;
        modelPositionA.y += elevationA;
        modelPositionB.y += elevationB;
        
        // Compute normal for lighting
        vec3 toA = normalize(modelPositionA - modelPosition.xyz);
        vec3 toB = normalize(modelPositionB - modelPosition.xyz);
        computedNormal = cross(toA, toB);
    }
    
    // Final position calculation
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    
    // Pass values to fragment shader
    vElevation = elevation;
    vNormal = computedNormal;
    vPosition = modelPosition.xyz;
}