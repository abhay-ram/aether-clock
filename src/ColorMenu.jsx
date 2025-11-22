import React, { useState, useEffect } from 'react';
import tinycolor from 'tinycolor2';

export default function ColorMenu({ 
  open, onClose, currentPalette, onApply, onSave, 
  sphereY, setSphereY, sphereScale, setSphereScale,
  rotationEnabled, setRotationEnabled, rotationSpeedX, setRotationSpeedX, rotationSpeedY, setRotationSpeedY,
  clockY, setClockY, clockScale, setClockScale, clockColor, setClockColor
}){
  const [base, setBase] = useState('#2b6ef6');
  const [palette, setPalette] = useState({});

  // Generate a nice palette from a base color using tinycolor2
  function generatePalette(hex) {
    const t = tinycolor(hex);
    
    // Generate a split-complementary scheme
    // This gives us the base color plus two colors adjacent to its complement
    const split = t.splitcomplement(); 
    // split[0] is base, split[1] and split[2] are the split complements
    
    // We can also try a triad or tetrad for more variety, but split-complementary is usually safe and pleasing
    
    const primary = t.toHexString();
    // Secondary: First split complement, slightly adjusted
    const secondary = split[1].toHexString();
    // Accent: Second split complement, brightened for pop
    const accent = split[2].saturate(20).lighten(10).toHexString();
    // Rim: Very light version of the base or secondary
    const rim = t.clone().lighten(40).saturate(10).toHexString();
    // Atmosphere: Analogous color to the secondary, light and airy
    const atmosphere = split[1].clone().spin(20).lighten(20).toHexString();

    return { primary, secondary, accent, rim, atmosphere };
  }

  // Initialize
  useEffect(() => {
    if (currentPalette && currentPalette.primary) {
      setBase(currentPalette.primary);
      setPalette(currentPalette);
    } else {
      const initialBase = '#2b6ef6';
      setBase(initialBase);
      setPalette(generatePalette(initialBase));
    }
  }, [currentPalette]);

  const handleBaseChange = (newBase) => {
    setBase(newBase);
    setPalette(generatePalette(newBase));
  };

  const handlePaletteChange = (key, val) => {
    setPalette(prev => ({ ...prev, [key]: val }));
  };

  const handleRandom = () => {
    const randomColor = tinycolor.random().toHexString();
    handleBaseChange(randomColor);
  };

  if(!open) return null;

  return (
    <div style={{
      position:'fixed', right:20, top:20, width:340, 
      background:'rgba(15,15,20,0.95)', color:'#eee', 
      padding:16, borderRadius:12, zIndex:9999, 
      fontFamily:'Inter, system-ui, sans-serif',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
        <strong style={{fontSize:16, fontWeight:600}}>Theme Editor</strong>
        <button onClick={onClose} style={{
          background:'transparent', color:'#aaa', border:0, fontSize:20, cursor:'pointer', padding:4
        }}>✕</button>
      </div>

      <div style={{marginBottom:20}}>
        <label style={{fontSize:12, color:'#888', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:1}}>Base Generator</label>
        <div style={{display:'flex', gap:10}}>
          <input 
            value={base} 
            onChange={e=>handleBaseChange(e.target.value)} 
            type="color" 
            style={{
              width:50, height:40, border:'none', padding:0, 
              background:'none', cursor:'pointer', borderRadius:4
            }} 
          />
          <button 
            onClick={handleRandom}
            style={{
              flex:1, background:'#333', color:'#fff', border:'1px solid #444', 
              borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:500
            }}
          >
            Randomize Scheme
          </button>
        </div>
      </div>

      <div style={{marginBottom:20}}>
        <label style={{fontSize:12, color:'#888', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:1}}>Palette Colors</label>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
          {Object.keys(palette).map(k=> (
            <div key={k} style={{background:'rgba(255,255,255,0.05)', padding:8, borderRadius:8, display:'flex', alignItems:'center', gap:10}}>
              <input 
                type="color" 
                value={palette[k]} 
                onChange={(e) => handlePaletteChange(k, e.target.value)}
                style={{
                  width:32, height:32, border:'none', padding:0, 
                  background:'none', cursor:'pointer', borderRadius:4
                }}
              />
              <div style={{flex:1}}>
                <div style={{fontSize:11, color:'#aaa', textTransform:'capitalize'}}>{k}</div>
                <div style={{fontSize:12, fontFamily:'monospace'}}>{palette[k]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{marginBottom:20}}>
        <label style={{fontSize:12, color:'#888', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:1}}>Geometry</label>
        <div style={{marginBottom:12}}>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4}}>
            <span>Vertical Position</span>
            <span>{sphereY.toFixed(2)}</span>
          </div>
          <input type="range" min={-6} max={2} step={0.01} value={sphereY} onChange={e=>setSphereY(parseFloat(e.target.value))} style={{width:'100%', accentColor: base}} />
        </div>
        <div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4}}>
            <span>Sphere Size</span>
            <span>{sphereScale.toFixed(2)}</span>
          </div>
          <input type="range" min={0.5} max={6} step={0.01} value={sphereScale} onChange={e=>setSphereScale(parseFloat(e.target.value))} style={{width:'100%', accentColor: base}} />
        </div>
        <div style={{marginTop:12}}>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4}}>
            <span>Clock Vertical Position</span>
            <span>{clockY.toFixed(2)}</span>
          </div>
          <input type="range" min={-3} max={5} step={0.01} value={clockY} onChange={e=>setClockY(parseFloat(e.target.value))} style={{width:'100%', accentColor: base}} />
        </div>
        <div style={{marginTop:12}}>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4}}>
            <span>Clock Size</span>
            <span>{clockScale.toFixed(2)}</span>
          </div>
          <input type="range" min={0.5} max={5} step={0.01} value={clockScale} onChange={e=>setClockScale(parseFloat(e.target.value))} style={{width:'100%', accentColor: base}} />
        </div>
        <div style={{marginTop:12}}>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4}}>
            <span>Clock Color</span>
            <span style={{fontFamily:'monospace'}}>{clockColor}</span>
          </div>
          <div style={{display:'flex', gap:10, alignItems:'center'}}>
            <input 
              type="color" 
              value={clockColor} 
              onChange={e=>setClockColor(e.target.value)} 
              style={{
                width:40, height:30, border:'none', padding:0, 
                background:'none', cursor:'pointer', borderRadius:4
              }} 
            />
            <input 
              type="text" 
              value={clockColor} 
              onChange={e=>setClockColor(e.target.value)}
              style={{
                flex:1, background:'transparent', border:'1px solid #444', 
                color:'#fff', fontSize:12, borderRadius:4, padding:6
              }}
            />
          </div>
        </div>
      </div>

      <div style={{marginBottom:20}}>
        <label style={{fontSize:12, color:'#888', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:1}}>Rotation</label>
        <div style={{marginBottom:12, display:'flex', alignItems:'center', gap:10}}>
          <input 
            type="checkbox" 
            checked={rotationEnabled} 
            onChange={e=>setRotationEnabled(e.target.checked)}
            style={{width:16, height:16, accentColor: base}}
          />
          <span style={{fontSize:13}}>Enable Rotation</span>
        </div>
        {rotationEnabled && (
          <>
            <div style={{marginBottom:12}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4}}>
                <span>Speed X</span>
                <input 
                  type="number" 
                  step={0.0001} 
                  value={rotationSpeedX} 
                  onChange={e=>setRotationSpeedX(parseFloat(e.target.value))}
                  style={{width:60, background:'transparent', border:'1px solid #444', color:'#fff', fontSize:11, borderRadius:4, padding:2}}
                />
              </div>
              <input type="range" min={-0.003} max={0.003} step={0.0001} value={rotationSpeedX} onChange={e=>setRotationSpeedX(parseFloat(e.target.value))} style={{width:'100%', accentColor: base}} />
            </div>
            <div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4}}>
                <span>Speed Y</span>
                <input 
                  type="number" 
                  step={0.0001} 
                  value={rotationSpeedY} 
                  onChange={e=>setRotationSpeedY(parseFloat(e.target.value))}
                  style={{width:60, background:'transparent', border:'1px solid #444', color:'#fff', fontSize:11, borderRadius:4, padding:2}}
                />
              </div>
              <input type="range" min={-0.003} max={0.003} step={0.0001} value={rotationSpeedY} onChange={e=>setRotationSpeedY(parseFloat(e.target.value))} style={{width:'100%', accentColor: base}} />
            </div>
          </>
        )}
      </div>

      <div style={{display:'flex', gap:8, marginTop: 12}}>
        <button 
          onClick={()=> onApply(palette)} 
          style={{
            flex: 2, padding:12, borderRadius:8, border:0, 
            background: base, color: tinycolor(base).isLight() ? '#000' : '#fff',
            fontWeight:600, cursor:'pointer', fontSize:14,
            transition: 'transform 0.1s',
            boxShadow: `0 4px 12px ${tinycolor(base).setAlpha(0.3).toRgbString()}`
          }}
        >
          Apply Changes
        </button>
        <button 
          onClick={()=> onSave(palette)} 
          style={{
            flex: 1, padding:12, borderRadius:8, border:0, 
            background: '#333', color: '#fff',
            fontWeight:600, cursor:'pointer', fontSize:14,
            border: '1px solid #444'
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
