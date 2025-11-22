import React from 'react';
import tinycolor from 'tinycolor2';

export default function BackgroundMenu({ 
  open, onClose, palette, onSave,
  bgSpeed, setBgSpeed,
  bgDensity, setBgDensity,
  bgIntensity, setBgIntensity,
  bgFrequency, setBgFrequency,
  clockAlphaTop, setClockAlphaTop,
  clockAlphaBottom, setClockAlphaBottom,
  clockGradientMin, setClockGradientMin,
  clockGradientMax, setClockGradientMax
}) {
  if (!open) return null;

  const accentColor = palette?.primary || '#2b6ef6';

  return (
    <div style={{
      position: 'fixed', left: 20, top: 20, width: 300, maxHeight: 'calc(100vh - 40px)', overflowY: 'auto',
      background: 'rgba(15,15,20,0.95)', color: '#eee',
      padding: 16, borderRadius: 12, zIndex: 9999,
      fontFamily: 'Inter, system-ui, sans-serif',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
        <strong style={{fontSize:16, fontWeight:600}}>Background Settings</strong>
        <button onClick={onClose} style={{
          background:'transparent', color:'#aaa', border:0, fontSize:20, cursor:'pointer', padding:4
        }}>✕</button>
      </div>

      <div style={{marginBottom:20}}>
        <label style={{fontSize:12, color:'#888', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:1}}>Scroll Speed</label>
        <div style={{display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4}}>
            <span>{bgSpeed.toFixed(2)}x</span>
        </div>
        <input 
          type="range" min={0} max={2} step={0.01} 
          value={bgSpeed} 
          onChange={e=>setBgSpeed(parseFloat(e.target.value))} 
          style={{width:'100%', accentColor: accentColor}} 
        />
      </div>

      <div style={{marginBottom:20}}>
        <label style={{fontSize:12, color:'#888', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:1}}>Fractal Density</label>
        <div style={{display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4}}>
            <span>{bgDensity.toFixed(1)}</span>
        </div>
        <input 
          type="range" min={1} max={15} step={0.1} 
          value={bgDensity} 
          onChange={e=>setBgDensity(parseFloat(e.target.value))} 
          style={{width:'100%', accentColor: accentColor}} 
        />
      </div>

      <div style={{marginBottom:20}}>
        <label style={{fontSize:12, color:'#888', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:1}}>Brightness</label>
        <div style={{display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4}}>
            <span>{bgIntensity.toFixed(2)}</span>
        </div>
        <input 
          type="range" min={0} max={3} step={0.1} 
          value={bgIntensity} 
          onChange={e=>setBgIntensity(parseFloat(e.target.value))} 
          style={{width:'100%', accentColor: accentColor}} 
        />
      </div>
      
       <div style={{marginBottom:20}}>
        <label style={{fontSize:12, color:'#888', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:1}}>Pulse Frequency</label>
        <div style={{display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4}}>
            <span>{bgFrequency.toFixed(2)}x</span>
        </div>
        <input 
          type="range" min={0.1} max={5} step={0.1} 
          value={bgFrequency} 
          onChange={e=>setBgFrequency(parseFloat(e.target.value))} 
          style={{width:'100%', accentColor: accentColor}} 
        />
      </div>

      <div style={{borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0', paddingTop: 20}}>
        <strong style={{fontSize:14, fontWeight:600, display:'block', marginBottom:16}}>Clock Style</strong>
        
        <div style={{marginBottom:20}}>
          <label style={{fontSize:12, color:'#888', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:1}}>Top Opacity</label>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4}}>
              <span>{(clockAlphaTop * 100).toFixed(0)}%</span>
          </div>
          <input 
            type="range" min={0} max={1} step={0.05} 
            value={clockAlphaTop} 
            onChange={e=>setClockAlphaTop(parseFloat(e.target.value))} 
            style={{width:'100%', accentColor: accentColor}} 
          />
        </div>

        <div style={{marginBottom:20}}>
          <label style={{fontSize:12, color:'#888', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:1}}>Bottom Opacity</label>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4}}>
              <span>{(clockAlphaBottom * 100).toFixed(0)}%</span>
          </div>
          <input 
            type="range" min={0} max={1} step={0.05} 
            value={clockAlphaBottom} 
            onChange={e=>setClockAlphaBottom(parseFloat(e.target.value))} 
            style={{width:'100%', accentColor: accentColor}} 
          />
        </div>

        <div style={{marginBottom:20}}>
          <label style={{fontSize:12, color:'#888', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:1}}>Gradient Start (Min Y)</label>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4}}>
              <span>{clockGradientMin.toFixed(2)}</span>
          </div>
          <input 
            type="range" min={-0.5} max={0.5} step={0.01} 
            value={clockGradientMin} 
            onChange={e=>setClockGradientMin(parseFloat(e.target.value))} 
            style={{width:'100%', accentColor: accentColor}} 
          />
        </div>

        <div style={{marginBottom:20}}>
          <label style={{fontSize:12, color:'#888', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:1}}>Gradient End (Max Y)</label>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4}}>
              <span>{clockGradientMax.toFixed(2)}</span>
          </div>
          <input 
            type="range" min={-0.5} max={0.5} step={0.01} 
            value={clockGradientMax} 
            onChange={e=>setClockGradientMax(parseFloat(e.target.value))} 
            style={{width:'100%', accentColor: accentColor}} 
          />
        </div>
      </div>

      <div style={{marginTop: 10}}>
        <button 
          onClick={()=> onSave(palette)} 
          style={{
            width: '100%', padding:12, borderRadius:8, border:0, 
            background: accentColor, 
            color: tinycolor(accentColor).isLight() ? '#000' : '#fff',
            fontWeight:600, cursor:'pointer', fontSize:14,
            transition: 'transform 0.1s',
            boxShadow: `0 4px 12px ${tinycolor(accentColor).setAlpha(0.3).toRgbString()}`
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
