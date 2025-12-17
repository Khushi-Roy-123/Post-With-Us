import React, { useState, useEffect } from 'react';
import { Tone, Audience } from '../types';


interface HomeViewProps {
  onGenerate: (topic: string, scheduleTime: string, tone: Tone, audience: Audience) => void;

  initialTopic: string;
  initialScheduleTime: string;
  initialTone: Tone;
  initialAudience: Audience;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onGenerate,

  initialTopic,
  initialScheduleTime,
  initialTone,
  initialAudience,
}) => {
  const [topicInput, setTopicInput] = useState<string>(initialTopic);
  const [scheduleTimeInput, setScheduleTimeInput] = useState<string>(initialScheduleTime);
  const [selectedTone, setSelectedTone] = useState<Tone>(initialTone);
  const [selectedAudience, setSelectedAudience] = useState<Audience>(initialAudience);
  const [showToneTooltip, setShowToneTooltip] = useState<boolean>(false);
  const [showAudienceTooltip, setShowAudienceTooltip] = useState<boolean>(false);


  // Load defaults from Settings
  useEffect(() => {
    if (initialTone === 'Professional' && initialAudience === 'General Public') {
      const savedTone = localStorage.getItem('default_tone');
      const savedAudience = localStorage.getItem('default_audience');
      if (savedTone) setSelectedTone(savedTone as Tone);
      if (savedAudience) setSelectedAudience(savedAudience as Audience);
    }
  }, [initialTone, initialAudience]);



  const handleGenerateContentSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (topicInput.trim()) {
      if (topicInput.trim()) {
        onGenerate(topicInput.trim(), scheduleTimeInput.trim(), selectedTone, selectedAudience);
      }
    }
  };

  const isFormValid = topicInput.trim().length > 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Content Configuration Panel */}
      <div className="flex flex-col space-y-5 bg-gray-50 p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 border-b border-gray-200 pb-3">Content Configuration</h2>

        <div className="space-y-5">
          <div className="relative z-10 group">
            <input
              type="text"
              id="topic-input"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder=" "
              className="peer w-full p-3.5 sm:p-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-800 bg-white"
              required
              aria-label="Content Topic"
            />
            <label
              htmlFor="topic-input"
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none transition-all duration-200 bg-white px-1
                ${topicInput ? 'text-xs -translate-y-9 peer-focus:-translate-y-9 peer-focus:text-blue-600' : 'peer-focus:-translate-y-9 peer-focus:text-blue-600'}
              `}
            >
              Topic (e.g., 'Future of AI')
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Tone Selection */}
            <div className="relative z-0">
              <select
                id="tone-select"
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value as Tone)}
                className="peer w-full p-3.5 sm:p-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white appearance-none text-gray-800 pr-10"
                aria-label="Select Content Tone"
              >
                <option value="Professional">Professional</option>
                <option value="Casual">Casual</option>
                <option value="Witty">Witty</option>
                <option value="Enthusiastic">Enthusiastic</option>
                <option value="Formal">Formal</option>
                <option value="Empathetic">Empathetic</option>
              </select>
              <label
                htmlFor="tone-select"
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none transition-all duration-200 bg-white px-1 text-xs -translate-y-9`}
              >
                Tone
              </label>

              {/* Chevron */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>

              {/* Info Icon & Tooltip */}
              <div className="absolute top-0 right-0 -mt-7">
                <button
                  type="button"
                  className="text-gray-400 hover:text-blue-500 p-1"
                  onClick={() => setShowToneTooltip(!showToneTooltip)}
                  onBlur={() => setTimeout(() => setShowToneTooltip(false), 200)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </button>
                {showToneTooltip && (
                  <div className="absolute right-0 bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 shadow-xl z-50 animate-fade-in">
                    The tone sets the overall style and emotional feel. It dictates word choice and sentence structure.
                  </div>
                )}
              </div>
            </div>

            {/* Target Audience Selection */}
            <div className="relative z-0">
              <select
                id="audience-select"
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value as Audience)}
                className="peer w-full p-3.5 sm:p-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white appearance-none text-gray-800 pr-10"
                aria-label="Select Target Audience"
              >
                <option value="General Public">General Public</option>
                <option value="Industry Experts">Industry Experts</option>
                <option value="Students">Students</option>
                <option value="Small Business Owners">Small Business Owners</option>
                <option value="Tech Enthusiasts">Tech Enthusiasts</option>
              </select>
              <label
                htmlFor="audience-select"
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none transition-all duration-200 bg-white px-1 text-xs -translate-y-9`}
              >
                Target Audience
              </label>

              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>

              {/* Info Icon & Tooltip */}
              <div className="absolute top-0 right-0 -mt-7">
                <button
                  type="button"
                  className="text-gray-400 hover:text-blue-500 p-1"
                  onClick={() => setShowAudienceTooltip(!showAudienceTooltip)}
                  onBlur={() => setTimeout(() => setShowAudienceTooltip(false), 200)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </button>
                {showAudienceTooltip && (
                  <div className="absolute right-0 bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 shadow-xl z-50 animate-fade-in">
                    Defines who the content is for, influencing language complexity and emphasized information.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-0">
            <input
              type="datetime-local"
              id="schedule-time-input"
              value={scheduleTimeInput}
              onChange={(e) => setScheduleTimeInput(e.target.value)}
              className="peer w-full p-3.5 sm:p-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-800 bg-white"
              aria-label="Optional Schedule Time"
            />
            <label
              htmlFor="schedule-time-input"
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none transition-all duration-200 bg-white px-1
                ${scheduleTimeInput ? 'text-xs -translate-y-9 peer-focus:-translate-y-9 peer-focus:text-blue-600' : 'peer-focus:-translate-y-9 peer-focus:text-blue-600'}
              `}
            >
              Optional: Schedule Time
            </label>
          </div>







          <button
            onClick={handleGenerateContentSubmit}
            className={`w-full py-3.5 rounded-xl shadow-lg transition-all duration-200 font-bold text-xl transform active:scale-[0.98]
            ${isFormValid
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}
          `}
            disabled={!isFormValid}
          >
            Generate Pipeline
          </button>

        </div>
      </div>
    </div >
  );
};