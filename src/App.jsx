import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import tinycolor from 'tinycolor2';
import FluidSphere from './FluidSphere';
import Clock from './Clock';
import ColorMenu from './ColorMenu';
import BackgroundMenu from './BackgroundMenu';
import GalaxyBackground from './GalaxyBackground';

const DEFAULT_SETTINGS = {
  palette: {
    primary: '#18d7c5',
    secondary: '#2c18d7',
    accent: '#ff9223',
    rim: '#bffcf6',
    atmosphere: '#a268ee'
  },
  sphereY: -5.67,
  sphereScale: 6.00,
  rotationEnabled: true,
  rotationSpeedX: -0.0003,
  rotationSpeedY: -0.0002,
  clockY: 0.90,
  clockScale: 4.62,
  clockColor: '#ffffff',
  clockHolographic: true,
  sphereShader: 'wave',
  bgSpeed: 0.58,
  bgDensity: 15.0,
  bgIntensity: 1.40,
  bgFrequency: 0.50
};

function generateInitialPalette(hex = '#0b3c8a'){
  const t = tinycolor(hex);
  const split = t.splitcomplement(); 
  
  const primary = t.toHexString();
  const secondary = split[1].toHexString();
  const accent = split[2].saturate(20).lighten(10).toHexString();
  const rim = t.clone().lighten(40).saturate(10).toHexString();
  const atmosphere = split[1].clone().spin(20).lighten(20).toHexString();

  return { primary, secondary, accent, rim, atmosphere };
}

const STORAGE_KEY = 'fluid-sphere-settings';

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return null;
}

function App() {
  const savedSettings = loadSettings();
  const initialPalette = savedSettings?.palette || DEFAULT_SETTINGS.palette;

  const [menuOpen, setMenuOpen] = useState(false);
  const [bgMenuOpen, setBgMenuOpen] = useState(false);
  const [palette, setPalette] = useState(initialPalette);
  const [sphereY, setSphereY] = useState(savedSettings?.sphereY ?? DEFAULT_SETTINGS.sphereY);
  const [sphereScale, setSphereScale] = useState(savedSettings?.sphereScale ?? DEFAULT_SETTINGS.sphereScale);
  const [rotationEnabled, setRotationEnabled] = useState(savedSettings?.rotationEnabled ?? DEFAULT_SETTINGS.rotationEnabled);
  const [rotationSpeedX, setRotationSpeedX] = useState(savedSettings?.rotationSpeedX ?? DEFAULT_SETTINGS.rotationSpeedX);
  const [rotationSpeedY, setRotationSpeedY] = useState(savedSettings?.rotationSpeedY ?? DEFAULT_SETTINGS.rotationSpeedY);
  const [clockY, setClockY] = useState(savedSettings?.clockY ?? DEFAULT_SETTINGS.clockY);
  const [clockScale, setClockScale] = useState(savedSettings?.clockScale ?? DEFAULT_SETTINGS.clockScale);
  const [clockColor, setClockColor] = useState(savedSettings?.clockColor ?? DEFAULT_SETTINGS.clockColor);
  const [clockHolographic, setClockHolographic] = useState(savedSettings?.clockHolographic ?? DEFAULT_SETTINGS.clockHolographic);
  const [sphereShader, setSphereShader] = useState(savedSettings?.sphereShader ?? DEFAULT_SETTINGS.sphereShader);
  
  // Background settings
  const [bgSpeed, setBgSpeed] = useState(savedSettings?.bgSpeed ?? DEFAULT_SETTINGS.bgSpeed);
  const [bgDensity, setBgDensity] = useState(savedSettings?.bgDensity ?? DEFAULT_SETTINGS.bgDensity);
  const [bgIntensity, setBgIntensity] = useState(savedSettings?.bgIntensity ?? DEFAULT_SETTINGS.bgIntensity);
  const [bgFrequency, setBgFrequency] = useState(savedSettings?.bgFrequency ?? DEFAULT_SETTINGS.bgFrequency);
  
  // Clock Gradient Settings
  const [clockAlphaTop, setClockAlphaTop] = useState(savedSettings?.clockAlphaTop ?? 1.0);
  const [clockAlphaBottom, setClockAlphaBottom] = useState(savedSettings?.clockAlphaBottom ?? 0.2);
  const [clockGradientMin, setClockGradientMin] = useState(savedSettings?.clockGradientMin ?? -0.2);
  const [clockGradientMax, setClockGradientMax] = useState(savedSettings?.clockGradientMax ?? 0.2);

  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 15000);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = (currentPalette) => {
    const settings = {
      palette: currentPalette,
      sphereY,
      sphereScale,
      rotationEnabled,
      rotationSpeedX,
      rotationSpeedY,
      clockY,
      clockScale,
      clockColor,
      clockHolographic,
      sphereShader,
      bgSpeed,
      bgDensity,
      bgIntensity,
      bgFrequency,
      clockAlphaTop,
      clockAlphaBottom,
      clockGradientMin,
      clockGradientMax
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    alert('Settings saved to local storage!');
  };

  const handleReset = () => {
    if(window.confirm('Are you sure you want to revert to default settings?')){
      setPalette(DEFAULT_SETTINGS.palette);
      setSphereY(DEFAULT_SETTINGS.sphereY);
      setSphereScale(DEFAULT_SETTINGS.sphereScale);
      setRotationEnabled(DEFAULT_SETTINGS.rotationEnabled);
      setRotationSpeedX(DEFAULT_SETTINGS.rotationSpeedX);
      setRotationSpeedY(DEFAULT_SETTINGS.rotationSpeedY);
      setClockY(DEFAULT_SETTINGS.clockY);
      setClockScale(DEFAULT_SETTINGS.clockScale);
      setClockColor(DEFAULT_SETTINGS.clockColor);
      setClockHolographic(DEFAULT_SETTINGS.clockHolographic);
      setSphereShader(DEFAULT_SETTINGS.sphereShader);
      setBgSpeed(DEFAULT_SETTINGS.bgSpeed);
      setBgDensity(DEFAULT_SETTINGS.bgDensity);
      setBgIntensity(DEFAULT_SETTINGS.bgIntensity);
      setBgFrequency(DEFAULT_SETTINGS.bgFrequency);
      setClockAlphaTop(1.0);
      setClockAlphaBottom(0.2);
      setClockGradientMin(-0.2);
      setClockGradientMax(0.2);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  useEffect(()=>{
    function onKey(e){
      // toggle menu with `c` key or Ctrl+K
      if(e.key === 'c' || (e.ctrlKey && e.key.toLowerCase() === 'k')){
        setMenuOpen(prev=>!prev);
        setShowHint(false);
      }
      // toggle background menu with `b` key
      if(e.key === 'b'){
        setBgMenuOpen(prev=>!prev);
        setShowHint(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <div style={{
        position: 'absolute', top: 20, left: 20, zIndex: 10,
        color: 'rgba(255,255,255,0.6)', fontFamily: 'sans-serif', fontSize: 14,
        background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: 6,
        backdropFilter: 'blur(4px)', pointerEvents: 'none',
        opacity: showHint ? 1 : 0, transition: 'opacity 1s ease-out'
      }}>
        Press <b>C</b> for Colors, <b>B</b> for Background
      </div>

      <BackgroundMenu
        open={bgMenuOpen}
        onClose={() => setBgMenuOpen(false)}
        palette={palette}
        onSave={handleSave}
        bgSpeed={bgSpeed} setBgSpeed={setBgSpeed}
        bgDensity={bgDensity} setBgDensity={setBgDensity}
        bgIntensity={bgIntensity} setBgIntensity={setBgIntensity}
        bgFrequency={bgFrequency} setBgFrequency={setBgFrequency}
        clockAlphaTop={clockAlphaTop} setClockAlphaTop={setClockAlphaTop}
        clockAlphaBottom={clockAlphaBottom} setClockAlphaBottom={setClockAlphaBottom}
        clockGradientMin={clockGradientMin} setClockGradientMin={setClockGradientMin}
        clockGradientMax={clockGradientMax} setClockGradientMax={setClockGradientMax}
      />

      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={['#000000']} />
        <GalaxyBackground 
          palette={palette} 
          bgSpeed={bgSpeed}
          bgDensity={bgDensity}
          bgIntensity={bgIntensity}
          bgFrequency={bgFrequency}
        />
        
        
        {/* Sphere Glow - simulates light emitting from the fluid sphere */}
        <pointLight 
          position={[0, sphereY + sphereScale * 0.5, 0]} 
          intensity={0} 
          color={palette.primary} 
          distance={12}
          decay={2}
        />
        <pointLight 
          position={[0, sphereY + sphereScale * 0.5, 2]} 
          intensity={0} 
          color={palette.secondary} 
          distance={10}
          decay={2}
        />

        <Clock 
          y={clockY} 
          scale={clockScale} 
          color={clockColor} 
          alphaTop={clockAlphaTop}
          alphaBottom={clockAlphaBottom}
          gradientMin={clockGradientMin}
          gradientMax={clockGradientMax}
        />
        <FluidSphere 
          position={[0, sphereY, 0]} 
          scale={sphereScale} 
          palette={palette} 
          rotationEnabled={rotationEnabled}
          rotationSpeedX={rotationSpeedX}
          rotationSpeedY={rotationSpeedY}
          shaderType={sphereShader}
        />
      </Canvas>

      <ColorMenu
        open={menuOpen}
        onClose={()=>setMenuOpen(false)}
        currentPalette={palette}
        onApply={(p)=> setPalette(p)}
        onSave={handleSave}
        onReset={handleReset}
        sphereY={sphereY}
        setSphereY={setSphereY}
        sphereScale={sphereScale}
        setSphereScale={setSphereScale}
        rotationEnabled={rotationEnabled}
        setRotationEnabled={setRotationEnabled}
        rotationSpeedX={rotationSpeedX}
        setRotationSpeedX={setRotationSpeedX}
        rotationSpeedY={rotationSpeedY}
        setRotationSpeedY={setRotationSpeedY}
        clockY={clockY}
        setClockY={setClockY}
        clockScale={clockScale}
        setClockScale={setClockScale}
        clockColor={clockColor}
        setClockColor={setClockColor}
        clockHolographic={clockHolographic}
        setClockHolographic={setClockHolographic}
        sphereShader={sphereShader}
        setSphereShader={setSphereShader}
      />
    </div>
  );
}

export default App;
