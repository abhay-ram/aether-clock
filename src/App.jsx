import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import tinycolor from 'tinycolor2';
import FluidSphere from './FluidSphere';
import Clock from './Clock';
import ColorMenu from './ColorMenu';

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
  const initialPalette = savedSettings?.palette || generateInitialPalette();

  const [menuOpen, setMenuOpen] = useState(false);
  const [palette, setPalette] = useState(initialPalette);
  const [sphereY, setSphereY] = useState(savedSettings?.sphereY ?? -3.2);
  const [sphereScale, setSphereScale] = useState(savedSettings?.sphereScale ?? 3.2);
  const [rotationEnabled, setRotationEnabled] = useState(savedSettings?.rotationEnabled ?? true);
  const [rotationSpeedX, setRotationSpeedX] = useState(savedSettings?.rotationSpeedX ?? 0.0003);
  const [rotationSpeedY, setRotationSpeedY] = useState(savedSettings?.rotationSpeedY ?? 0.0005);
  const [clockY, setClockY] = useState(savedSettings?.clockY ?? 1.6);
  const [clockScale, setClockScale] = useState(savedSettings?.clockScale ?? 2.2);
  const [clockColor, setClockColor] = useState(savedSettings?.clockColor ?? '#ffffff');
  const [clockHolographic, setClockHolographic] = useState(savedSettings?.clockHolographic ?? true);
  const [showSeconds, setShowSeconds] = useState(savedSettings?.showSeconds ?? false);
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
      showSeconds
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    alert('Settings saved to local storage!');
  };

  useEffect(()=>{
    function onKey(e){
      // toggle menu with `c` key or Ctrl+K
      if(e.key === 'c' || (e.ctrlKey && e.key.toLowerCase() === 'k')){
        setMenuOpen(prev=>!prev);
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
        Press <b>C</b> to customize
      </div>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={['#000000']} />
        <Clock 
          y={clockY} 
          scale={clockScale} 
          color={clockColor} 
          holographic={clockHolographic} 
          showSeconds={showSeconds}
        />
        <FluidSphere 
          position={[0, sphereY, 0]} 
          scale={sphereScale} 
          palette={palette} 
          rotationEnabled={rotationEnabled}
          rotationSpeedX={rotationSpeedX}
          rotationSpeedY={rotationSpeedY}
        />
      </Canvas>

      <ColorMenu
        open={menuOpen}
        onClose={()=>setMenuOpen(false)}
        currentPalette={palette}
        onApply={(p)=> setPalette(p)}
        onSave={handleSave}
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
        showSeconds={showSeconds}
        setShowSeconds={setShowSeconds}
      />
    </div>
  );
}

export default App;
