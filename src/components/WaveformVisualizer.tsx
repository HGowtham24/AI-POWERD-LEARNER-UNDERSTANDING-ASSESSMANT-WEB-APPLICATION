import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  frequencies: number[];
  isRecording: boolean;
  isPaused?: boolean;
  volumeLevel?: number;
  height?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  frequencies,
  isRecording,
  isPaused = false,
  volumeLevel = 0,
  height = 90,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, width, h);

    const barCount = 36;
    const barWidth = Math.max(3, Math.floor((width / barCount) * 0.55));
    const gap = Math.max(2, Math.floor((width - barCount * barWidth) / (barCount - 1)));

    for (let i = 0; i < barCount; i++) {
      // Map frequency data or idle wave
      let rawVal = frequencies[i % frequencies.length] || 10;
      if (!isRecording) {
        // Subtle ambient idle breathing wave
        rawVal = 12 + Math.sin(Date.now() / 400 + i * 0.3) * 6;
      } else if (isPaused) {
        rawVal = 10;
      }

      // Height calculation with minimum threshold
      const normalized = Math.min(1, Math.max(0.08, rawVal / 255));
      const barHeight = Math.max(6, normalized * (h * 0.85));

      const x = i * (barWidth + gap);
      const y = (h - barHeight) / 2;

      // Gradient styling (indigo -> violet -> purple)
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      if (isRecording) {
        gradient.addColorStop(0, '#6366f1'); // Indigo 500
        gradient.addColorStop(0.5, '#8b5cf6'); // Violet 500
        gradient.addColorStop(1, '#a855f7'); // Purple 500
      } else {
        gradient.addColorStop(0, '#94a3b8'); // Slate 400
        gradient.addColorStop(1, '#cbd5e1'); // Slate 300
      }

      ctx.fillStyle = gradient;
      // Rounded pill bars
      ctx.beginPath();
      const radius = barWidth / 2;
      ctx.roundRect(x, y, barWidth, barHeight, radius);
      ctx.fill();
    }
  }, [frequencies, isRecording, isPaused, volumeLevel]);

  return (
    <div className="relative w-full flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/5 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm">
      <canvas
        ref={canvasRef}
        width={480}
        height={height}
        className="w-full max-w-lg h-[90px] block"
      />
      {isRecording && !isPaused && (
        <div className="mt-1 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
            Live Audio Signal Active
          </span>
        </div>
      )}
    </div>
  );
};
