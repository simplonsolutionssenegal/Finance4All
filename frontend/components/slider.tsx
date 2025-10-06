'use client';

import { Minus, Plus } from 'lucide-react';
import React, { useState, useRef, useCallback, useEffect } from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  icon: React.ReactNode;
  formatValue: (value: number) => string;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step,
  label,
  icon,
  formatValue,
  className = '',
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateValue(e.clientX);
  };

  const updateValue = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const newValue = min + (percentage / 100) * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));

      onChange(clampedValue);
    },
    [min, max, step, onChange]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e.clientX);
      }
    },
    [isDragging, updateValue]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateValue(e.touches[0].clientX);
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        updateValue(e.touches[0].clientX);
      }
    },
    [isDragging, updateValue]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Gestion des événements de souris et tactile
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const increment = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4'>
        <div className='flex items-center gap-2 text-gray-700 text-sm sm:text-base font-medium'>
          {icon}
          {label}
        </div>
        <div className='flex items-center gap-2 sm:gap-3'>
          <button
            onClick={decrement}
            disabled={value <= min}
            className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 active:scale-95'
            aria-label={`Diminuer ${label}`}
          >
            <Minus className='w-4 h-4 sm:w-5 sm:h-5 text-gray-700' />
          </button>
          <div className='min-w-[80px] sm:min-w-[100px] text-center sm:text-right'>
            <div className='text-gray-900 font-bold text-lg sm:text-xl'>{formatValue(value)}</div>
          </div>
          <button
            onClick={increment}
            disabled={value >= max}
            className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 active:scale-95'
            aria-label={`Augmenter ${label}`}
          >
            <Plus className='w-4 h-4 sm:w-5 sm:h-5 text-gray-700' />
          </button>
        </div>
      </div>

      <div className='relative'>
        <div
          ref={sliderRef}
          className='relative h-2 sm:h-3 bg-gray-200 rounded-full cursor-pointer touch-none'
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          role='slider'
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-label={label}
        >
          <div
            className='absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-200'
            style={{ width: `${percentage}%` }}
          />
          <div
            className='absolute top-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-white border-2 border-teal-500 rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-110 active:scale-95'
            style={{ left: `${percentage}%` }}
          />
        </div>

        <div className='flex justify-between text-xs sm:text-sm text-gray-500 mt-2'>
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      </div>
    </div>
  );
}
