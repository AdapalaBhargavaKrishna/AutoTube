import React from 'react';

const CircularProgress = ({ completionRate = 0 }) => {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - completionRate / 100);

  return (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <svg className="w-32 h-32 transform -rotate-90">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">
            {Math.round(completionRate)}%
          </p>
          <p className="text-xs text-gray-500">Complete</p>
        </div>
      </div>
    </div>
  );
};

export default CircularProgress;
