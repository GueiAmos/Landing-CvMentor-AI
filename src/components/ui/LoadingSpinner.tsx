import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6 sm:w-8 sm:h-8',
    lg: 'w-8 h-8 sm:w-12 sm:h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8">
      <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
      {text && <p className="mt-3 sm:mt-4 text-gray-600 text-center text-sm sm:text-base">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;