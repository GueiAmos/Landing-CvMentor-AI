import React from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'orange' | 'green' | 'red';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  label, 
  showPercentage = true, 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    red: 'bg-red-500'
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <span className="text-sm sm:text-base font-semibold text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm sm:text-base font-medium text-gray-500">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
        <div
          className={`h-3 sm:h-4 rounded-full transition-all duration-700 ease-out shadow-sm ${colorClasses[color]}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;