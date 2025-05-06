uniform float uTime;
uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uBigWavesSpeed;

uniform float uSmallWavesElevation;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesSpeed;
uniform float uSmallIterations;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/perlinClassic3D.glsl

float waveElevation(vec3 position, vec3 normal) // Added normal parameter
{
    float bigWave = sin(position.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) *
                    sin(position.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) *
                    uBigWavesElevation;

    float elevation = bigWave;

    for(float i = 1.0; i <= uSmallIterations; i++)
    {
        elevation -= abs(perlinClassic3D(position * uSmallWavesFrequency * i + vec3(0.0, uTime * uSmallWavesSpeed, 0.0)) * uSmallWavesElevation / i);
    }

    return elevation;
}

void main()
{
    // Base position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec3 worldPosition = modelPosition.xyz;

    // Calculate the original normal (before displacement)
    vec3 normal = normalize(position); // For icosphere, position is proportional to normal

    // Elevation based on world position and original normal
    float elevation = waveElevation(worldPosition, normal); // Pass normal to waveElevation
    modelPosition.xyz += normal * elevation; // Displace along the normal

    // Compute normal (approximate using finite differences on the sphere)
    float shift = 0.01;
    vec3 positionA = position + vec3(shift, 0.0, 0.0);
    vec3 positionB = position + vec3(0.0, shift, 0.0);
    vec3 positionC = position + vec3(0.0, 0.0, shift);

    vec4 modelPositionA = modelMatrix * vec4(positionA, 1.0);
    vec4 modelPositionB = modelMatrix * vec4(positionB, 1.0);
    vec4 modelPositionC = modelMatrix * vec4(positionC, 1.0);

    float elevationA = waveElevation(modelPositionA.xyz, normalize(positionA));
    float elevationB = waveElevation(modelPositionB.xyz, normalize(positionB));
    float elevationC = waveElevation(modelPositionC.xyz, normalize(positionC));

    vec3 worldPositionA = modelPositionA.xyz + normalize(positionA) * elevationA;
    vec3 worldPositionB = modelPositionB.xyz + normalize(positionB) * elevationB;
    vec3 worldPositionC = modelPositionC.xyz + normalize(positionC) * elevationC;

    vec3 normalA = normalize(worldPositionB - worldPosition);
    vec3 normalB = normalize(worldPositionC - worldPosition);
    vec3 computedNormal = normalize(cross(normalA, normalB));

    // Final position
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Varyings
    vElevation = elevation;
    vNormal = computedNormal;
    vPosition = worldPosition;
}