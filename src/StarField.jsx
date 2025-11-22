import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;

// Pseudo-random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float starLayer(vec2 uv, float scale, float threshold, float brightness) {
    vec2 grid = uv * scale;
    vec2 id = floor(grid);
    vec2 cell = fract(grid) - 0.5;
    
    float rnd = random(id);
    float star = 0.0;
    
    if (rnd > threshold) {
        float dist = length(cell);
        // Sharp core
        float core = smoothstep(0.1, 0.0, dist);
        // Subtle glow
        float glow = smoothstep(0.4, 0.0, dist) * 0.3;
        
        // Randomize brightness slightly
        float b = brightness * (0.5 + 0.5 * rnd);
        star = (core + glow) * b;
    }
    return star;
}

void main() {
    vec3 color = vec3(0.0);
    vec2 uv = vUv;
    
    // Layer 1: Many tiny distant stars
    color += vec3(starLayer(uv, 500.0, 0.9, 0.5));
    
    // Layer 2: Medium stars
    color += vec3(starLayer(uv + vec2(12.45), 250.0, 0.95, 0.7));
    
    // Layer 3: Few bright stars
    color += vec3(starLayer(uv + vec2(93.12), 100.0, 0.98, 1.0));

    gl_FragColor = vec4(color, 1.0);
}
`;

const StarField = () => {
  const meshRef = useRef();

  return (
    <mesh ref={meshRef} scale={100}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.BackSide}
      />
    </mesh>
  );
};

export default StarField;
