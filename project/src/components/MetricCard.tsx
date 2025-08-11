import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  onClick?: () => void;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  trend,
  onClick,
  loading = false
}) => {
  const CardWrapper = onClick ? 'button' : 'div';
  
  return (
    <CardWrapper
      onClick={onClick}
      className={`bg-white dark:bg-dark-800 rounded-lg shadow border border-gray-200 dark:border-dark-700 p-4 sm:p-6 transition-all duration-200 ${
        onClick ? 'hover:shadow-md hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500' : ''
      } ${loading ? 'animate-pulse' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 sm:space-x-4 min-w-0 flex-1">
          <div className={`${iconColor} p-2 sm:p-3 rounded-full shadow-lg flex-shrink-0`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
              {title}
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {loading ? (
                <span className="bg-gray-200 dark:bg-dark-600 h-6 w-16 rounded animate-pulse inline-block"></span>
              ) : (
                value
              )}
            </p>
            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 truncate mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {trend && !loading && (
          <div className={`flex items-center space-x-1 flex-shrink-0 ml-2 ${
            trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            <span className="text-xs sm:text-sm font-medium">
              {Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </div>
      
      {trend?.label && !loading && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-700">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {trend.label}
          </p>
        </div>
      )}
    </CardWrapper>
  );
};

export default MetricCard;