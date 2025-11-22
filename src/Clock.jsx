import React, { useState, useEffect } from 'react';
import { Text } from '@react-three/drei';

const Clock = ({ y = 1.6, scale = 2.2, color = "white" }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;

  // Slightly higher and behind the sphere so it gets partially occluded
  const pos = [0, y, -2.6];

  return (
    <group position={pos}>
      <Text
        position={[0, 0, 0]}
        fontSize={scale}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        fontWeight="800"
        letterSpacing={-0.05}
        fillOpacity={0.98}
      >
        {timeString}
      </Text>
    </group>
  );
};

export default Clock;
