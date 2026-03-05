import React from 'react';

interface LoadingProps {
  variant?: 'spinner' | 'skeleton';
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'medium',
  text,
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  if (variant === 'skeleton') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div
          className={`${sizeClasses[size]} bg-gray-200 animate-pulse rounded-md`}
        />
        {text && (
          <div
            className={`h-4 bg-gray-200 animate-pulse rounded-md ${textSizeClasses[size]}`}
            style={{ width: text.length * 8 }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`}
      />
      {text && (
        <p className={`text-gray-600 ${textSizeClasses[size]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;