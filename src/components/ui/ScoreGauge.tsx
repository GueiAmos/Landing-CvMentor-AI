import React from 'react';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ 
  score, 
  maxScore = 10, 
  label, 
  size = 'md' 
}) => {
  const percentage = (score / maxScore) * 100;
  const strokeDasharray = `${percentage * 2.83}, 283`;
  
  const sizeClasses = {
    sm: { width: 80, height: 80, strokeWidth: 6, fontSize: 'text-lg' },
    md: { width: 120, height: 120, strokeWidth: 8, fontSize: 'text-2xl' },
    lg: { width: 160, height: 160, strokeWidth: 10, fontSize: 'text-3xl' }
  };
  
  const { width, height, strokeWidth, fontSize } = sizeClasses[size];
  
  const getColor = (score: number) => {
    if (score >= 8) return '#10b981'; // green
    if (score >= 6) return '#f59e0b'; // yellow
    if (score >= 4) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={width} height={height} className="transform -rotate-90">
          <circle
            cx={width / 2}
            cy={height / 2}
            r={45}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={width / 2}
            cy={height / 2}
            r={45}
            stroke={getColor(score)}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${fontSize} font-bold text-gray-800`}>
          <span>{score.toFixed(1)}</span>
          <span className="text-xs text-gray-500">/{maxScore}</span>
        </div>
      </div>
      {label && <p className="mt-2 text-sm text-gray-600 text-center">{label}</p>}
    </div>
  );
};

export default ScoreGauge;