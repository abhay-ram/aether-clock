import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vViewPosition;
varying vec3 vViewNormal;

void main() {
  vUv = uv;
  vPosition = position;
  
  // Calculate view space position and normal for correct Fresnel
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  vViewNormal = normalMatrix * normal;
  
  gl_Position = projectionMatrix * mvPosition;
}
`;



const fragmentShader = `
uniform float uTime;
uniform vec3 uBaseColor;
uniform vec3 uSecondaryColor;
uniform vec3 uAccentColor;
uniform vec3 uRimColor;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vViewPosition;
varying vec3 vViewNormal;

// Simplex 3D Noise 
// by Ian McEwan, Ashima Arts
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0.0 + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

// FBM
float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    // Reduced octaves from 5 to 3 for smoother, less detailed look
    for (int i = 0; i < 3; i++) {
        value += amplitude * snoise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Color Palette (IQ)
vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
  // Base scale - reduced further for much larger, smoother patterns
  vec3 p = vPosition * 0.4;
  
  // Create a seamless loop using the time uniform
  // We map time to a circular path in the noise domain
  float loopLen = 120.0; // Matches the JS reset
  float t = uTime;
  float angle = (t / loopLen) * 6.2831853;
  
  // Circular motion radius - determines speed of change
  // Smaller radius = slower animation
  float radius = 0.5; 
  vec3 timeOffset = vec3(cos(angle), sin(angle), 0.0) * radius;

  // Domain Warping
  // q is the first layer of warping
  vec3 q = vec3(0.0);
  q.x = fbm(p + vec3(0.0, 0.0, 0.0) + timeOffset);
  q.y = fbm(p + vec3(5.2, 1.3, 2.8) + timeOffset);
  q.z = fbm(p + vec3(2.2, 8.3, 1.8) + timeOffset);

  // r is the second layer of warping, using q
  // Reduced warping strength (6.0 -> 2.0) for less chaotic swirls
  vec3 r = vec3(0.0);
  r.x = fbm(p + 2.0*q + vec3(1.7, 9.2, 0.3) + timeOffset);
  r.y = fbm(p + 2.0*q + vec3(8.3, 2.8, 1.2) + timeOffset);
  r.z = fbm(p + 2.0*q + vec3(1.2, 3.4, 5.6) + timeOffset);

  // Final noise value
  float f = fbm(p + 2.0*r);

  // Color mixing
  // We want that "oil slick" look with sharp bands of color
  
  // 1. Create a base rainbow-like palette that shifts with the noise
  // This palette mimics thin-film interference
  vec3 col = palette(f * 1.5 + length(q), 
                     vec3(0.5, 0.5, 0.5), 
                     vec3(0.5, 0.5, 0.5), 
                     vec3(1.0, 1.0, 1.0), 
                     vec3(0.0, 0.33, 0.67));

  // 2. Inject the palette colors (provided as uniforms)
  vec3 deepBlue = uBaseColor;
  vec3 brightCyan = uSecondaryColor;
  vec3 goldenOrange = uAccentColor;
  vec3 hotPink = uRimColor;

  // Use the warped coordinates to mix these colors
  // High contrast mixing
  float mix1 = smoothstep(0.2, 0.8, q.x);
  float mix2 = smoothstep(0.2, 0.8, r.y);
  float mix3 = smoothstep(0.2, 0.8, f);

  vec3 c1 = mix(deepBlue, brightCyan, mix1);
  vec3 c2 = mix(goldenOrange, hotPink, mix2);
  
  // Combine the palette approach with the specific colors
  // We use the 'f' value to switch between the cool and warm tones
  vec3 finalCol = mix(c1, c2, mix3);
  
  // Overlay the interference pattern for extra detail
  finalCol += col * 0.15;
  
  // Ensure positive values before pow to avoid NaN/White screen issues
  finalCol = max(finalCol, 0.0);

  // Boost saturation/contrast
  finalCol = pow(finalCol, vec3(0.9)); // Less aggressive gamma
  finalCol *= 1.1; // Slight brightness boost

  // Fresnel effect for the sphere edge (Rim Light)
  // Using View Space vectors ensures the rim light stays static relative to the camera
  vec3 viewDir = normalize(vViewPosition);
  vec3 normal = normalize(vViewNormal);
  float fresnel = pow(1.0 - dot(viewDir, normal), 3.0);
  
  // Add the rim light using a rim color uniform influence
  finalCol += uRimColor * fresnel * 0.6; 

  gl_FragColor = vec4(finalCol, 1.0);
}
`;

const atmosphereVertexShader = `
varying vec3 vViewPosition;
varying vec3 vViewNormal;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  vViewNormal = normalMatrix * normal;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const atmosphereFragmentShader = `
uniform vec3 uAtmosphereColor;
uniform float uAtmosphereStrength;
varying vec3 vViewPosition;
varying vec3 vViewNormal;

void main() {
  vec3 viewDir = normalize(vViewPosition);
  vec3 normal = normalize(vViewNormal);
  
  // Calculate Fresnel effect (0.0 at center, 1.0 at edge)
  float fresnel = pow(1.0 - dot(viewDir, normal), 2.0);
  
  // Output color with alpha based on fresnel and strength
  vec3 col = uAtmosphereColor * fresnel * uAtmosphereStrength;
  gl_FragColor = vec4(col, fresnel * 0.8);
}
`;





const waveFragmentShader = `
uniform float uTime;
uniform vec3 uBaseColor;
uniform vec3 uSecondaryColor;
uniform vec3 uAccentColor;
uniform vec3 uRimColor;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vViewPosition;
varying vec3 vViewNormal;

// Simplex 3D Noise 
// by Ian McEwan, Ashima Arts
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  // Permutations
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

// Fractal Brownian Motion (FBM)
float fbm(vec3 p) {
  float f = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    f += amp * snoise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return f;
}

float bounceOut(float x) {
    const float n1 = 7.5625;
    const float d1 = 2.75;
    if (x < 1.0 / d1) {
        return n1 * x * x;
    } else if (x < 2.0 / d1) {
        x -= 1.5 / d1;
        return n1 * x * x + 0.75;
    } else if (x < 2.5 / d1) {
        x -= 2.25 / d1;
        return n1 * x * x + 0.9375;
    } else {
        x -= 2.625 / d1;
        return n1 * x * x + 0.984375;
    }
}

float bounceIn(float x) {
    return 1.0 - bounceOut(1.0 - x);
}

void main() {
    // Slower animation
    float t = uTime * 0.08;
    
    // Base frequency
    float freq = 3.0;
    vec3 pos = vPosition * freq;
    
    // Rotation
    float c = cos(t * 0.5);
    float s = sin(t * 0.5);
    mat2 rot = mat2(c, -s, s, c);
    pos.xy = rot * pos.xy;

    // Domain warping using FBM for richer detail
    vec3 q = pos + vec3(fbm(pos + vec3(0.0, t * 0.6, 0.0)));
    vec3 r = pos + vec3(fbm(q + vec3(1.0, -0.5, 0.7))) * 0.6;

    // Layered Noise (kept for broader motion)
    float n1 = snoise(r + t);
    float n2 = snoise(r * 2.0 - t * 1.5) * 0.5;
    float noise = n1 + n2 + fbm(r * 0.5) * 0.5;

    // Complex Wave Pattern
    float w1 = cos((r.x + r.y + noise * 0.5) * 3.14159 + t * 0.2);
    float w2 = sin((r.z - r.x + noise * 0.5) * 2.0 - t * 0.15);
    float wave = (w1 + w2) * 0.5;

    // Map to 0-1 for easing
    float t_val = wave * 0.5 + 0.5;
    float ease = bounceIn(t_val);

    // Multi-stage color mixing with subtle FBM-driven variation
    vec3 col;
    float patternMod = smoothstep(-0.2, 0.8, fbm(r * 0.7));
    vec3 mix1 = mix(uBaseColor, uSecondaryColor, smoothstep(0.0, 0.4, ease) * (0.6 + 0.4 * patternMod));
    vec3 mix2 = mix(mix1, uAccentColor, smoothstep(0.4, 0.8, ease));
    col = mix(mix2, uRimColor, smoothstep(0.8, 1.0, ease));

    // Sparkles: high-frequency noise accentuating highlights
    float sparkle = abs(snoise(r * 40.0 + vec3(t * 5.0)));
    sparkle = smoothstep(0.8, 0.95, sparkle);
    sparkle = pow(sparkle, 3.0);
    col += uRimColor * sparkle * 0.6 * ease;

    // Fresnel rim for extra glow
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vViewNormal);
    float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 3.0);
    col += uRimColor * fresnel * 0.8;

    gl_FragColor = vec4(col, 1.0);
}
`;

const FluidSphere = (props) => {
  const groupRef = useRef();
  const meshRef = useRef();
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color(0.0, 0.05, 0.2) },
      uSecondaryColor: { value: new THREE.Color(0.0, 0.8, 0.9) },
      uAccentColor: { value: new THREE.Color(1.0, 0.6, 0.1) },
      uRimColor: { value: new THREE.Color(1.0, 0.9, 0.8) },
      uAtmosphereColor: { value: new THREE.Color(0.4, 0.7, 1.0) },
      uAtmosphereStrength: { value: 1.0 },
    }),
    []
  );

  useFrame((state) => {
    const { clock } = state;
    
     // Rotate the whole group
     if (groupRef.current) {
       if (props.rotationEnabled !== false) {
         const rx = props.rotationSpeedX !== undefined ? props.rotationSpeedX : 0.005;
         const ry = props.rotationSpeedY !== undefined ? props.rotationSpeedY : 0.0025;
         groupRef.current.rotation.x += rx;
         groupRef.current.rotation.y += ry;
       }
     }

    // Update shader uniforms on the fluid mesh
    if (meshRef.current) {
      const loopDuration = 120; 
      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime() % loopDuration;
      // If a palette prop is passed, update the palette uniforms in-place so materials update immediately
      if (props.palette) {
        try {
          if (props.palette.primary) uniforms.uBaseColor.value.set(props.palette.primary);
          if (props.palette.secondary) uniforms.uSecondaryColor.value.set(props.palette.secondary);
          if (props.palette.accent) uniforms.uAccentColor.value.set(props.palette.accent);
          if (props.palette.rim) uniforms.uRimColor.value.set(props.palette.rim);
          if (props.palette.atmosphere) uniforms.uAtmosphereColor.value.set(props.palette.atmosphere);
        } catch (e) {
          // ignore invalid palette values
        }
      }
    }
  });

  const getFragmentShader = () => {
    switch (props.shaderType) {
      case 'wave': return waveFragmentShader;
      default: return fragmentShader;
    }
  };

  return (
    <group ref={groupRef} {...props}>
      {/* Fluid Sphere */}
      <mesh ref={meshRef} scale={1}>
        <sphereGeometry args={[1, 128, 128]} />
        <shaderMaterial
          key={props.shaderType} // Force re-render when shader type changes
          vertexShader={vertexShader}
          fragmentShader={getFragmentShader()}
          uniforms={uniforms}
        />
      </mesh>
      
      {/* Atmosphere Overlay - Deactivated
      <mesh scale={1.008}> 
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={{ uAtmosphereColor: uniforms.uAtmosphereColor, uAtmosphereStrength: uniforms.uAtmosphereStrength }}
          blending={THREE.AdditiveBlending}
          side={THREE.FrontSide}
          transparent
          depthWrite={false} 
        />
      </mesh>
      */}
    </group>
  );
};

export default FluidSphere;
