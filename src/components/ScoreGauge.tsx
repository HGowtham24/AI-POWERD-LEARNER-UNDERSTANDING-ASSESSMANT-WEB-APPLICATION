import React from 'react';

interface ScoreGaugeProps {
  score: number; // 0 - 100
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  sublabel?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 'lg',
  label = 'Understanding Score',
  sublabel,
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  const dimensions = {
    sm: { width: 110, stroke: 9, radius: 42, textSize: 'text-2xl', labelSize: 'text-xs' },
    md: { width: 160, stroke: 12, radius: 62, textSize: 'text-3xl', labelSize: 'text-sm' },
    lg: { width: 220, stroke: 16, radius: 86, textSize: 'text-5xl', labelSize: 'text-sm' },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let colorScheme = {
    stroke: '#10b981', // emerald
    bgGlow: 'from-emerald-500/10 to-teal-500/10',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    status: 'Mastery Level',
  };

  if (clampedScore < 55) {
    colorScheme = {
      stroke: '#f43f5e', // rose
      bgGlow: 'from-rose-500/10 to-red-500/10',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      status: 'Needs Revision',
    };
  } else if (clampedScore < 72) {
    colorScheme = {
      stroke: '#f59e0b', // amber
      bgGlow: 'from-amber-500/10 to-orange-500/10',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      status: 'Developing',
    };
  } else if (clampedScore < 85) {
    colorScheme = {
      stroke: '#6366f1', // indigo
      bgGlow: 'from-indigo-500/10 to-purple-500/10',
      badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
      status: 'Proficient',
    };
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div
        className={`relative flex items-center justify-center rounded-full p-2 bg-gradient-to-b ${colorScheme.bgGlow}`}
      >
        <svg
          width={dimensions.width}
          height={dimensions.width}
          className="transform -rotate-90"
        >
          {/* Background Track */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={dimensions.radius}
            stroke="currentColor"
            strokeWidth={dimensions.stroke}
            className="text-slate-200 dark:text-slate-800"
            fill="transparent"
          />
          {/* Animated Value Ring */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={dimensions.radius}
            stroke={colorScheme.stroke}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${dimensions.textSize} font-extrabold tracking-tight text-slate-900 dark:text-white`}>
            {clampedScore}
            <span className="text-xl font-semibold text-slate-400 dark:text-slate-500">%</span>
          </span>
          {size !== 'sm' && (
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Score
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-col items-center">
        <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
          {label}
        </span>
        <span
          className={`mt-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${colorScheme.badge}`}
        >
          {sublabel || colorScheme.status}
        </span>
      </div>
    </div>
  );
};
