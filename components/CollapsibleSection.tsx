import React from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  forceOpen?: boolean; // New prop to force the section to be always open
  action?: React.ReactNode; // Optional action element in the header
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  isOpen,
  onToggle,
  forceOpen = false,
  action,
}) => {
  const currentOpenState = forceOpen || isOpen;

  return (
    <div className="border border-gray-200 rounded-2xl mb-4 shadow-sm bg-white overflow-hidden transition-all duration-300">
      <div className="flex flex-wrap sm:flex-nowrap justify-between items-center w-full p-4 bg-gray-50/50 border-b border-gray-100 gap-3">
          <button
            type="button"
            className="flex-1 text-left focus:outline-none flex items-center min-w-0"
            onClick={forceOpen ? undefined : onToggle}
            aria-expanded={currentOpenState}
            disabled={forceOpen}
          >
             {!forceOpen && (
              <svg
                className={`w-5 h-5 mr-2 transition-transform duration-200 text-gray-400 shrink-0 ${currentOpenState ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            )}
            <span className="font-bold text-gray-800 text-lg truncate">{title}</span>
          </button>
          
          {action && (
              <div className="flex items-center shrink-0" onClick={(e) => e.stopPropagation()}>
                  {action}
              </div>
          )}
      </div>
      {(currentOpenState) && (
        <div className="p-4 sm:p-6 bg-white animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};