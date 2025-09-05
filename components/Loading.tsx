'use client';

import { useEffect, useState } from 'react';
import Navbar from './Navbar';

interface LoadingProps {
  duration?: number;
}

export default function Loading({ duration = 2000 }: LoadingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 100);

    const completeTimer = setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
    }, duration - 300);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [duration]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Progress Bar */}
        <div className="fixed top-14 left-0 right-0 z-40">
          <div className="h-0.5 bg-gray-100">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
}