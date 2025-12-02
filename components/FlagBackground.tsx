
import React, { useEffect, useRef } from 'react';

export const FlagBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 💾 DATA: Canvas Configuration
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // 🟠 UTIL: Flag Physical Properties
    const stripes = 13;
    const unionWidth = 0.4; // 40% of flag width
    const unionHeight = 7 / 13; // 7 stripes worth

    // 🟠 UTIL: Fabric Wave Physics
    let time = 0;
    const primaryWave = {
      amplitude: 25,
      frequency: 0.015,
      speed: 0.08
    };
    const secondaryWave = {
      amplitude: 12,
      frequency: 0.035,
      speed: 0.12
    };
    const tertiaryWave = {
      amplitude: 6,
      frequency: 0.08,
      speed: 0.15
    };

    // 🟠 UTIL: Fabric Lighting & Texture
    const calculateFabricShading = (x: number, y: number, time: number) => {
      // Multi-layered wave for realistic cloth ripples
      const wave1 = Math.sin(x * primaryWave.frequency + time * primaryWave.speed) * primaryWave.amplitude;
      const wave2 = Math.sin(x * secondaryWave.frequency - time * secondaryWave.speed) * secondaryWave.amplitude;
      const wave3 = Math.cos(x * tertiaryWave.frequency + time * tertiaryWave.speed) * tertiaryWave.amplitude;

      // Calculate lighting based on wave angle
      const dx = Math.cos(x * primaryWave.frequency + time * primaryWave.speed) * primaryWave.amplitude;
      const angle = Math.atan(dx);
      const lighting = Math.cos(angle) * 0.3 + 0.7; // Range: 0.4 to 1.0

      return {
        offset: wave1 + wave2 + wave3,
        lighting: lighting
      };
    };

    // 🟠 UTIL: Enhanced Color with Fabric Texture
    const applyFabricTexture = (baseColor: string, lighting: number, x: number, y: number) => {
      // Parse RGB
      const rgb = baseColor.match(/\w\w/g)?.map(h => parseInt(h, 16)) || [0, 0, 0];

      // Apply lighting
      const r = Math.floor(rgb[0] * lighting);
      const g = Math.floor(rgb[1] * lighting);
      const b = Math.floor(rgb[2] * lighting);

      // Add subtle fabric weave texture
      const weaveNoise = (Math.sin(x * 0.5) * Math.cos(y * 0.5)) * 5;

      return `rgb(${Math.max(0, Math.min(255, r + weaveNoise))}, ${Math.max(0, Math.min(255, g + weaveNoise))}, ${Math.max(0, Math.min(255, b + weaveNoise))})`;
    };

    // 🟠 UTIL: Star Drawing Helper
    const drawStar = (cx: number, cy: number, size: number, color: string) => {
      ctx.fillStyle = color;
      ctx.shadowColor = 'rgba(255,255,255,0.3)';
      ctx.shadowBlur = 4;

      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = cx + size * Math.cos(angle);
        const y = cy + size * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    let animationFrameId: number;

    // 🟢 CORE: Main Rendering Function
    const drawRealisticFlag = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const stripeHeight = canvas.height / stripes;
      const flagUnionWidth = canvas.width * unionWidth;
      const flagUnionHeight = canvas.height * unionHeight;

      // Draw stripes with realistic fabric physics
      for (let i = 0; i < stripes; i++) {
        const baseColor = i % 2 === 0 ? '#B22234' : '#FFFFFF';
        const y = i * stripeHeight;

        // Draw stripe as series of vertical segments for lighting variation
        // Optimized: step by 4px for performance in React
        for (let x = 0; x < canvas.width; x += 4) {
          const fabric = calculateFabricShading(x, y, time);
          const color = applyFabricTexture(baseColor, fabric.lighting, x, y);

          ctx.fillStyle = color;
          ctx.fillRect(x, y + fabric.offset, 5, stripeHeight + 8); // Overlap slightly to prevent gaps
        }
      }

      // Draw union (blue field) with fabric texture
      for (let x = 0; x < flagUnionWidth; x += 4) {
        for (let y = 0; y < flagUnionHeight; y += 4) {
          const fabric = calculateFabricShading(x, y, time);
          const color = applyFabricTexture('#3C3B6E', fabric.lighting, x, y);

          ctx.fillStyle = color;
          ctx.fillRect(x, y + fabric.offset, 5, 5);
        }
      }

      // Draw stars with wave displacement
      const starRows = 9;
      const starSpacingX = flagUnionWidth / 12;
      const starSpacingY = flagUnionHeight / 10;
      const starSize = Math.min(starSpacingX, starSpacingY) * 0.4;

      for (let row = 0; row < starRows; row++) {
        const starsInRow = row % 2 === 0 ? 6 : 5;
        const offsetX = row % 2 === 0 ? starSpacingX : starSpacingX * 2;

        for (let col = 0; col < starsInRow; col++) {
          const x = offsetX + col * starSpacingX * 2;
          const y = starSpacingY + row * starSpacingY;
          const fabric = calculateFabricShading(x, y, time);

          // Apply lighting to stars
          const starLighting = fabric.lighting;
          const starColor = `rgba(255, 255, 255, ${0.85 + starLighting * 0.15})`;

          drawStar(x, y + fabric.offset, starSize, starColor);
        }
      }

      time += 1;
      animationFrameId = requestAnimationFrame(drawRealisticFlag);
    };

    // 🟢 CORE: Initialize Animation
    drawRealisticFlag();

    return () => {
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
      <canvas
        ref={canvasRef}
        id="flagCanvas"
        className="absolute top-0 left-0 w-full h-full z-0 flag-canvas-shadow pointer-events-none"
      />
  );
};
