import React, { useState, useEffect, useCallback } from 'react';
import { PipelineResults } from '../types';
import { CollapsibleSection } from './CollapsibleSection';

interface ResultsViewProps {
  topic: string;
  results: PipelineResults;
  onSchedulePost: () => void;
  onBackToHome: () => void;
  onSaveEditedContent: (updatedResults: PipelineResults) => void;
  onNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
  isScheduling: boolean;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  topic,
  results,
  onSchedulePost,
  onBackToHome,
  onSaveEditedContent,
  onNotification,
  isScheduling,
}) => {
  const [activeTab, setActiveTab] = useState<'hooks' | 'outline' | 'linkedin' | 'instagram' | 'blog' | 'seo'>('hooks');

  // Track editing state per section
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});
  const [editableResults, setEditableResults] = useState<PipelineResults>(results);

  // Local state for raw string inputs that need parsing (like hashtags)
  const [instagramHashtagsRaw, setInstagramHashtagsRaw] = useState('');

  // Draft State
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null);

  // Create a unique key for storage based on the topic
  const STORAGE_KEY = `content_pipeline_draft_${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;

  // State for confirmation dialog
  const [showDiscardDialog, setShowDiscardDialog] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Check for existing draft on mount or when topic changes
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setHasDraft(true);
        if (parsed.timestamp) {
          setDraftTimestamp(new Date(parsed.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
        }
      } catch (e) {
        // Corrupt data
        localStorage.removeItem(STORAGE_KEY);
      }
    } else {
      setHasDraft(false);
      setDraftTimestamp(null);
    }
  }, [STORAGE_KEY, topic]);

  const hasUnsavedChanges = useCallback(() => {
    return JSON.stringify(results) !== JSON.stringify(editableResults);
  }, [results, editableResults]);

  const isEditingAny = Object.values(editingSections).some(Boolean);

  // Draft Handlers
  const handleSaveDraft = () => {
    try {
      const draftData = {
        results: editableResults,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
      setHasDraft(true);
      setDraftTimestamp(new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
      if (onNotification) onNotification('Draft saved locally!', 'success');
    } catch (e) {
      console.error("Failed to save draft", e);
      if (onNotification) onNotification('Failed to save draft.', 'error');
    }
  };

  const handleRestoreDraft = () => {
    try {
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.results) {
          setEditableResults(parsed.results);
          if (onNotification) onNotification('Draft restored successfully!', 'success');
        }
      }
    } catch (e) {
      if (onNotification) onNotification('Failed to restore draft.', 'error');
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasDraft(false);
    setDraftTimestamp(null);
    if (onNotification) onNotification('Draft discarded.', 'info');
  };

  const handleSectionEdit = (key: string) => {
    setEditingSections(prev => ({ ...prev, [key]: true }));
    // Initialize raw inputs for complex fields
    if (key === 'instagram') {
      const tags = editableResults.instagram.hashtags || [];
      setInstagramHashtagsRaw(tags.map(tag => `#${tag}`).join(', '));
    }
  };

  const handleSectionCancel = (key: string) => {
    setEditableResults(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (key === 'instagram') {
        next.instagram = JSON.parse(JSON.stringify(results.instagram));
      } else {
        (next as any)[key] = (results as any)[key];
      }
      return next;
    });
    setEditingSections(prev => ({ ...prev, [key]: false }));
  };

  const handleSectionSave = (key: string) => {
    const newResults = JSON.parse(JSON.stringify(results));

    if (key === 'instagram') {
      // Parse the raw hashtags string back into the array
      const processedHashtags = instagramHashtagsRaw
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(t => t.length > 0);

      newResults.instagram = {
        caption: editableResults.instagram.caption,
        hashtags: processedHashtags
      };

      // Update local editable state to match the saved data
      setEditableResults(prev => ({
        ...prev,
        instagram: newResults.instagram
      }));
    } else {
      (newResults as any)[key] = (editableResults as any)[key];
    }

    onSaveEditedContent(newResults);
    setEditingSections(prev => ({ ...prev, [key]: false }));
  };

  const handleBackToHomeClick = () => {
    if (hasUnsavedChanges()) {
      setPendingAction(() => onBackToHome);
      setShowDiscardDialog(true);
    } else {
      onBackToHome();
    }
  };

  const handleExport = () => {
    const exportData = JSON.stringify(editableResults, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-pipeline-${topic.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (onNotification) onNotification("Pipeline exported to JSON!", 'success');
  };

  const confirmDiscard = () => {
    if (pendingAction) {
      pendingAction();
    }
    setShowDiscardDialog(false);
    setPendingAction(null);
  };

  const cancelDiscard = () => {
    setShowDiscardDialog(false);
    setPendingAction(null);
  };

  const handleChange = useCallback((section: keyof PipelineResults | 'instagram.caption' | 'instagram.hashtags', value: string | string[]) => {
    setEditableResults((prev) => {
      const newResults: PipelineResults = JSON.parse(JSON.stringify(prev));
      if (section === 'instagram.caption') {
        newResults.instagram.caption = value as string;
      } else if (section === 'instagram.hashtags') {
        // Note: We use instagramHashtagsRaw for editing, this path might not be used directly by textarea onChange
        // but keeping logic consistent just in case.
        newResults.instagram.hashtags = (value as string)
          .split(',')
          .map(tag => tag.trim().replace(/^#/, ''))
          .filter(tag => tag !== '');
      } else if (section === 'seo_keywords') {
        newResults.seo_keywords = (value as string)
          .split(',')
          .map(keyword => keyword.trim())
          .filter(keyword => keyword !== '');
      } else {
        (newResults[section] as string) = value as string;
      }
      return newResults;
    });
  }, []);

  const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
  const countChars = (text: string) => text.length;

  const renderSectionAction = (key: string) => {
    const isEditing = editingSections[key];
    return (
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <button
              onClick={() => handleSectionSave(key)}
              className="px-2.5 py-1 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded shadow-sm focus:ring-2 focus:ring-green-500 whitespace-nowrap"
              title="Save Changes"
            >
              Save
            </button>
            <button
              onClick={() => handleSectionCancel(key)}
              className="px-2.5 py-1 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded focus:ring-2 focus:ring-gray-300 whitespace-nowrap"
              title="Cancel Editing"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => handleSectionEdit(key)}
            className="flex items-center px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
            title="Edit Section"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            Edit
          </button>
        )}
      </div>
    );
  };

  const renderContent = (key: keyof PipelineResults, content: string | string[] | { caption: string; hashtags: string[] }) => {
    const isEditing = editingSections[key];
    const textAreaHeightClass = key === 'blog' ? 'h-96' : key === 'outline' ? 'h-64' : 'h-32';

    if (isEditing) {
      switch (key) {
        case 'hooks':
        case 'outline':
        case 'linkedin':
        case 'blog': {
          const currentValue = editableResults[key] as string;
          return (
            <div className="animate-fade-in">
              <textarea
                value={currentValue}
                onChange={(e) => handleChange(key, e.target.value)}
                className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 resize-y text-base ${textAreaHeightClass}`}
                aria-label={`Edit ${key.replace('_', ' ')}`}
              />
              {(key === 'linkedin') && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1 text-right">
                  {countWords(currentValue)} words / {countChars(currentValue)} characters (LinkedIn max 150 words)
                </p>
              )}
            </div>
          );
        }
        case 'instagram': {
          const instContent = editableResults.instagram;
          return (
            <div className="animate-fade-in space-y-3">
              <div>
                <label htmlFor="instagram-caption" className="block text-sm font-medium text-gray-700 mb-1">Caption:</label>
                <textarea
                  id="instagram-caption"
                  value={instContent.caption}
                  onChange={(e) => handleChange('instagram.caption', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 h-32 text-base"
                  aria-label="Edit Instagram caption"
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-1 text-right">
                  {countWords(instContent.caption)} words / {countChars(instContent.caption)} characters (Instagram max 100 words)
                </p>
              </div>

              <div>
                <label htmlFor="instagram-hashtags" className="block text-sm font-medium text-gray-700 mb-1">Hashtags (comma-separated):</label>
                <textarea
                  id="instagram-hashtags"
                  value={instagramHashtagsRaw}
                  onChange={(e) => setInstagramHashtagsRaw(e.target.value)}
                  placeholder="#example, #trend, #AI"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 h-20 text-base"
                  aria-label="Edit Instagram hashtags"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas.</p>
              </div>
            </div>
          );
        }
        case 'seo_keywords': {
          const currentSeoKeywordsString = Array.isArray(editableResults.seo_keywords) ? editableResults.seo_keywords.join(', ') : '';
          return (
            <div className="animate-fade-in">
              <label htmlFor="seo-keywords" className="block text-sm font-medium text-gray-700 mb-1">SEO Keywords (comma-separated):</label>
              <textarea
                id="seo-keywords"
                value={currentSeoKeywordsString}
                onChange={(e) => handleChange('seo_keywords', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 h-32 text-base"
                aria-label="Edit SEO keywords"
              />
            </div>
          );
        }
        default:
          return null;
      }
    } else {
      if (typeof content === 'string') {
        const lines = content.split('\n');
        return (
          <div className="prose prose-sm sm:prose-base max-w-none text-gray-800 leading-relaxed">
            {lines.map((line, index) => {
              if (line.startsWith('# ')) return <h2 key={index} className="text-xl sm:text-2xl font-bold mt-5 mb-3 text-gray-900">{line.substring(2)}</h2>;
              if (line.startsWith('## ')) return <h3 key={index} className="text-lg sm:text-xl font-bold mt-4 mb-2 text-gray-800">{line.substring(3)}</h3>;
              if (line.startsWith('### ')) return <h4 key={index} className="text-base sm:text-lg font-semibold mt-3 mb-2 text-gray-800">{line.substring(4)}</h4>;
              if (line.startsWith('- ')) return <li key={index} className="ml-5 list-disc mb-1">{line.substring(2)}</li>;
              if (line.trim() === '') return <div key={index} className="h-2"></div>;
              return <p key={index} className="mb-2">{line}</p>;
            })}
          </div>
        );
      } else if (Array.isArray(content)) {
        return (
          <ul className="list-disc list-inside space-y-2 text-gray-800">
            {content.map((item, index) => (
              <li key={index} className="leading-snug">{item}</li>
            ))}
          </ul>
        );
      } else if (key === 'instagram') {
        const instContent = content as { caption: string; hashtags: string[] };
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Caption</p>
              <p className="whitespace-pre-wrap text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{instContent.caption}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Hashtags</p>
              <div className="flex flex-wrap gap-2">
                {instContent.hashtags.map((tag, i) => (
                  <span key={i} className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-sm font-medium">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        );
      }
      return null;
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header with Title and Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 truncate">
            Pipeline: <span className="text-blue-600">"{topic}"</span>
          </h2>
        </div>
        <button
          onClick={handleExport}
          className="shrink-0 px-4 py-2 bg-white text-slate-700 rounded-lg font-medium text-sm flex items-center justify-center transition-all shadow-sm border border-slate-200 hover:bg-slate-50 hover:shadow-md active:scale-95"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export JSON
        </button>
      </div>

      {/* Draft Controls Bar */}
      {(hasDraft || isEditingAny) && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center text-blue-800">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            <span className="text-sm font-bold">Draft Mode</span>
          </div>

          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {isEditingAny && (
              <button
                onClick={handleSaveDraft}
                className="flex-1 sm:flex-none text-sm px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm font-semibold whitespace-nowrap"
              >
                Save Progress
              </button>
            )}

            {hasDraft && (
              <>
                <button
                  onClick={handleRestoreDraft}
                  className="flex-1 sm:flex-none text-sm px-4 py-2 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors shadow-sm font-semibold whitespace-nowrap"
                  title={draftTimestamp ? `Saved: ${draftTimestamp}` : ''}
                >
                  Restore <span className="hidden lg:inline">Draft</span>
                </button>
                <button
                  onClick={handleClearDraft}
                  className="flex-1 sm:flex-none text-sm px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm font-semibold whitespace-nowrap"
                >
                  Discard
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tabs - Scrollable on mobile */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex sm:justify-center overflow-x-auto pb-2 gap-2 no-scrollbar scroll-smooth">
          {['hooks', 'outline', 'linkedin', 'instagram', 'blog', 'seo'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 capitalize whitespace-nowrap flex-shrink-0 border
                    ${activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md border-transparent scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
              aria-pressed={activeTab === tab}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'hooks' && <CollapsibleSection title="Viral Hooks" isOpen={true} onToggle={() => { }} forceOpen={true} action={renderSectionAction('hooks')}>
          {renderContent('hooks', editableResults.hooks || [])}
        </CollapsibleSection>}
        {activeTab === 'outline' && <CollapsibleSection title="Detailed Outline" isOpen={true} onToggle={() => { }} forceOpen={true} action={renderSectionAction('outline')}>
          {renderContent('outline', editableResults.outline)}
        </CollapsibleSection>}
        {activeTab === 'linkedin' && <CollapsibleSection title="LinkedIn Post" isOpen={true} onToggle={() => { }} forceOpen={true} action={renderSectionAction('linkedin')}>
          {renderContent('linkedin', editableResults.linkedin)}
        </CollapsibleSection>}
        {activeTab === 'instagram' && <CollapsibleSection title="Instagram Content" isOpen={true} onToggle={() => { }} forceOpen={true} action={renderSectionAction('instagram')}>
          {renderContent('instagram', editableResults.instagram)}
        </CollapsibleSection>}
        {activeTab === 'blog' && <CollapsibleSection title="Blog Article" isOpen={true} onToggle={() => { }} forceOpen={true} action={renderSectionAction('blog')}>
          {renderContent('blog', editableResults.blog)}
        </CollapsibleSection>}
        {activeTab === 'seo' && <CollapsibleSection title="SEO Strategy" isOpen={true} onToggle={() => { }} forceOpen={true} action={renderSectionAction('seo_keywords')}>
          {renderContent('seo_keywords', editableResults.seo_keywords)}
        </CollapsibleSection>}

      </div>

      {(editableResults.scheduled || editableResults.schedulingMessage) && (
        <div className={`p-4 rounded-xl text-center font-medium border flex items-center justify-center gap-2 ${editableResults.scheduled ? 'bg-green-50 text-green-800 border-green-100' : 'bg-red-50 text-red-800 border-red-100'}`} role="status">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <p>{editableResults.schedulingMessage || 'This content was marked for scheduling by the AI agent!'}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <button
          onClick={onSchedulePost}
          className={`py-4 px-6 rounded-xl shadow-lg transition-all duration-200 font-bold flex items-center justify-center
            ${isScheduling || isEditingAny
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl'}`}
          aria-label="Schedule post (mock)"
          disabled={isScheduling || isEditingAny}
        >
          {isScheduling ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Scheduling...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Schedule Post
            </>
          )}
        </button>
        <button
          onClick={handleBackToHomeClick}
          className={`py-4 px-6 rounded-xl shadow-lg transition-all duration-200 font-bold flex items-center justify-center
             ${isScheduling
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
          aria-label="Generate new content"
          disabled={isScheduling}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Start New Project
        </button>
      </div>

      {showDiscardDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Unsaved Changes</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">You have edits that haven't been applied or saved. Are you sure you want to discard them?</p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={cancelDiscard}
                className="px-5 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-bold"
              >
                Keep Editing
              </button>
              <button
                onClick={confirmDiscard}
                className="px-5 py-3 text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors font-bold shadow-md"
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};