import React from 'react';
import { LoadingStep } from '../types'; // Ensure LoadingStep is imported

interface LoadingViewProps {
  steps: string[];
  currentStepIndex: number;
  phase: 'news' | 'content' | null; // New prop to indicate loading phase
}

export const LoadingView: React.FC<LoadingViewProps> = ({ steps, currentStepIndex, phase }) => {
  const loadingMessage = phase === 'news' ? 'Fetching real-time news...' : 'Generating your content pipeline...';

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-8">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-5 h-5 rounded-full bg-blue-500 animate-bounce delay-0"></div>
        <div className="w-5 h-5 rounded-full bg-blue-500 animate-bounce delay-100"></div>
        <div className="w-5 h-5 rounded-full bg-blue-500 animate-bounce delay-200"></div>
      </div>
      <p className="text-2xl font-bold text-gray-800 text-center">{loadingMessage}</p>
      <ul className="w-full max-w-md space-y-4 mt-6">
        {steps.map((step, index) => (
          <li
            key={step}
            className={`flex items-center text-lg p-4 rounded-xl shadow-sm transition-all duration-300 ease-in-out border
              ${index < currentStepIndex ? 'bg-green-50 text-green-700 border-green-200' : ''}
              ${index === currentStepIndex ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse' : ''}
              ${index > currentStepIndex ? 'bg-gray-50 text-gray-500 border-gray-200' : ''}
            `}
          >
            <span className="mr-4">
              {index < currentStepIndex ? (
                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : index === currentStepIndex ? (
                <svg className="animate-spin w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12c0 1.577.538 3.037 1.442 4.26M19 19v-5h-.581m-15.356-2A8.001 8.001 0 0120 12c0-1.577-.538-3.037-1.442-4.26"></path>
                </svg>
              ) : (
                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              )}
            </span>
            <span className={`${index === currentStepIndex ? 'font-semibold text-blue-800' : ''}`}>{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};