import React, { useState, useEffect, useMemo } from 'react';
import { Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

const vertexShader = `
varying vec3 vPosition;
void main() {
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform vec3 uColor;
uniform float uAlphaTop;
uniform float uAlphaBottom;
uniform float uGradientMin;
uniform float uGradientMax;
varying vec3 vPosition;

void main() {
  // Vertical gradient based on Y position
  // Text size is 0.35, centered around 0
  float t = smoothstep(uGradientMin, uGradientMax, vPosition.y);
  
  // Fade from transparent at bottom to opaque at top
  float alpha = mix(uAlphaBottom, uAlphaTop, t);
  
  gl_FragColor = vec4(uColor, alpha);
}
`;

const Clock = ({ 
  y = 1.6, scale = 2.2, color = "white", 
  alphaTop = 1.0, alphaBottom = 0.2,
  gradientMin = -0.2, gradientMax = 0.2 
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;

  // Position adjusted for 3D text
  const pos = [0, y, -2.0];

  const materialRef = React.useRef();

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uColor.value.set(color);
      materialRef.current.uniforms.uAlphaTop.value = alphaTop;
      materialRef.current.uniforms.uAlphaBottom.value = alphaBottom;
      materialRef.current.uniforms.uGradientMin.value = gradientMin;
      materialRef.current.uniforms.uGradientMax.value = gradientMax;
    }
  }, [color, alphaTop, alphaBottom, gradientMin, gradientMax, timeString]);

  const initialUniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(color) },
    uAlphaTop: { value: alphaTop },
    uAlphaBottom: { value: alphaBottom },
    uGradientMin: { value: gradientMin },
    uGradientMax: { value: gradientMax }
  }), []); // Only create once

  const clockText = useMemo(() => (
    <Center key={scale} scale={[scale, scale, 1]}>
      <Text3D
        font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
        size={0.35}
        height={0}
        curveSegments={12}
        bevelEnabled={false}
      >
        {timeString}
        <shaderMaterial 
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={initialUniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </Text3D>
    </Center>
  ), [timeString, scale]); // Removed uniforms dependency

  return (
    <group position={pos}>
      {clockText}
    </group>
  );
};

export default Clock;
