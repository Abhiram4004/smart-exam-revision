import React from 'react';

export default function ProgressRing({
  progress = 0,
  size = 120,
  strokeWidth = 10,
  color = '#2563eb',
  label = 'Goal'
}) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
          fill="transparent"
        />
        {/* Animated Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 0.8s ease-in-out',
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-extrabold text-gray-900 dark:text-white">
          {Math.round(normalizedProgress)}%
        </span>
        {label && (
          <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

