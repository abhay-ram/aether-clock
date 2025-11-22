import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uPrimaryColor;
uniform vec3 uSecondaryColor;
uniform vec3 uAccentColor;
uniform float uSpeed;
uniform float uDensity;
uniform float uIntensity;
uniform float uFrequency;
varying vec2 vUv;

// CBS
// Parallax scrolling fractal galaxy.
// Inspired by JoshP's Simplicity shader: https://www.shadertoy.com/view/lslGWr

// http://www.fractalforums.com/new-theories-and-research/very-simple-formula-for-fractal-patterns/
float field(in vec3 p,float s) {
	float strength = uDensity + .03 * log(1.e-6 + fract(sin(uTime) * 4373.11));
	float accum = s/4.;
	float prev = 0.;
	float tw = 0.;
	for (int i = 0; i < 26; ++i) {
		float mag = dot(p, p);
		p = abs(p) / mag + vec3(-.5, -.4, -1.5);
		float w = exp(-float(i) / 7.);
		accum += w * exp(-strength * pow(abs(mag - prev), 2.2));
		tw += w;
		prev = mag;
	}
	return max(0., 5. * accum / tw - .7);
}

// Less iterations for second layer
float field2(in vec3 p, float s) {
	float strength = uDensity + .03 * log(1.e-6 + fract(sin(uTime) * 4373.11));
	float accum = s/4.;
	float prev = 0.;
	float tw = 0.;
	for (int i = 0; i < 18; ++i) {
		float mag = dot(p, p);
		p = abs(p) / mag + vec3(-.5, -.4, -1.5);
		float w = exp(-float(i) / 7.);
		accum += w * exp(-strength * pow(abs(mag - prev), 2.2));
		tw += w;
		prev = mag;
	}
	return max(0., 5. * accum / tw - .7);
}

vec3 nrand3( vec2 co )
{
	vec3 a = fract( cos( co.x*8.3e-3 + co.y )*vec3(1.3e5, 4.7e5, 2.9e5) );
	vec3 b = fract( sin( co.x*0.3e-3 + co.y )*vec3(8.1e5, 1.0e5, 0.1e5) );
	vec3 c = mix(a, b, 0.5);
	return c;
}

void main() {
    vec2 uv = 2. * vUv - 1.;
	vec2 uvs = uv * uResolution.xy / max(uResolution.x, uResolution.y);
    
    // Apply speed to time for movement
    float t_anim = uTime * uSpeed;
    
	vec3 p = vec3(uvs / 4., 0) + vec3(1., -1.3, 0.);
	p += .2 * vec3(sin(t_anim / 16.), sin(t_anim / 12.),  sin(t_anim / 128.));
	
	float freqs[4];
    // Mock sound with some time-based variation, scaled by frequency
    freqs[0] = 0.2 + 0.1 * sin(t_anim * 2.0 * uFrequency);
	freqs[1] = 0.3 + 0.1 * cos(t_anim * 1.5 * uFrequency);
	freqs[2] = 0.4 + 0.1 * sin(t_anim * 1.0 * uFrequency);
	freqs[3] = 0.5 + 0.1 * cos(t_anim * 0.5 * uFrequency);

	float t = field(p,freqs[2]);
	float v = (1. - exp((abs(uv.x) - 1.) * 6.)) * (1. - exp((abs(uv.y) - 1.) * 6.));
	
    //Second Layer
	vec3 p2 = vec3(uvs / (4.+sin(t_anim*0.11)*0.2+0.2+sin(t_anim*0.15)*0.3+0.4), 1.5) + vec3(2., -1.3, -1.);
	p2 += 0.25 * vec3(sin(t_anim / 16.), sin(t_anim / 12.),  sin(t_anim / 128.));
	float t2 = field2(p2,freqs[3]);
	
    // Use palette colors for the second layer
    vec3 col2 = uSecondaryColor * (t2 * t2 * 1.8) + uAccentColor * (t2 * freqs[0]);
	vec4 c2 = mix(.4, 1., v) * vec4(col2, t2);
	
	
	//Let's add some stars
	vec2 seed = p.xy * 2.0;	
	seed = floor(seed * uResolution.x);
	vec3 rnd = nrand3( seed );
	vec4 starcolor = vec4(pow(rnd.y,40.0));
	
	//Second Layer
	vec2 seed2 = p2.xy * 2.0;
	seed2 = floor(seed2 * uResolution.x);
	vec3 rnd2 = nrand3( seed2 );
	starcolor += vec4(pow(rnd2.y,40.0));
	
    // Use palette colors for the first layer
    vec3 col1 = uPrimaryColor * (t * t * 1.5) + uSecondaryColor * (t * freqs[1]);
	gl_FragColor = (mix(freqs[3]-.3, 1., v) * vec4(col1, 1.0) + c2 + starcolor) * uIntensity;
    gl_FragColor.a = 1.0;
}
`;

const GalaxyBackground = ({ palette, bgSpeed = 1.0, bgDensity = 7.0, bgIntensity = 1.0, bgFrequency = 1.0 }) => {
  const meshRef = useRef();
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uPrimaryColor: { value: new THREE.Color(palette?.primary || '#000000') },
      uSecondaryColor: { value: new THREE.Color(palette?.secondary || '#000000') },
      uAccentColor: { value: new THREE.Color(palette?.accent || '#000000') },
      uSpeed: { value: bgSpeed },
      uDensity: { value: bgDensity },
      uIntensity: { value: bgIntensity },
      uFrequency: { value: bgFrequency },
    }),
    []
  );

  // Update uniforms when palette changes
  React.useEffect(() => {
    if (meshRef.current && palette) {
      meshRef.current.material.uniforms.uPrimaryColor.value.set(palette.primary);
      meshRef.current.material.uniforms.uSecondaryColor.value.set(palette.secondary);
      meshRef.current.material.uniforms.uAccentColor.value.set(palette.accent);
    }
  }, [palette]);

  // Update uniforms when settings change
  React.useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uSpeed.value = bgSpeed;
      meshRef.current.material.uniforms.uDensity.value = bgDensity;
      meshRef.current.material.uniforms.uIntensity.value = bgIntensity;
      meshRef.current.material.uniforms.uFrequency.value = bgFrequency;
    }
  }, [bgSpeed, bgDensity, bgIntensity, bgFrequency]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
      meshRef.current.material.uniforms.uResolution.value.set(size.width, size.height);
    }
  });

  return (
    <mesh ref={meshRef} scale={[1, 1, 1]} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

export default GalaxyBackground;
