import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 className={`animate-spin text-primary-600 dark:text-primary-400 ${sizeClasses[size]}`} />
      {text && (
        <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;