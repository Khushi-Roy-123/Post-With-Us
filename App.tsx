import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { QuickPostFeature } from './components/QuickPostFeature';
import { TrendingFeature } from './components/TrendingFeature';
import { CalendarFeature } from './components/CalendarFeature';
import { SettingsFeature } from './components/SettingsFeature'; // Import Settings
import { HomeView } from './components/HomeView';
import { LoadingView } from './components/LoadingView';
import { ResultsView } from './components/ResultsView';
import { LandingPage } from './components/LandingPage'; // Import LandingPage
import { PipelineResults, Tone, Audience, NewsArticle } from './types';

type AppScreen = 'home' | 'loading' | 'results';
type LoadingPhase = 'news' | 'content';
type Feature = 'agent' | 'quick' | 'trending' | 'settings' | 'calendar';

const loadingSteps = {
  news: ['Fetching Real-time News'],
  content: [
    'Generating Outline',
    'Crafting LinkedIn Post',
    'Creating Instagram Caption',
    'Writing Blog Article',
    'Optimizing SEO',
    'Formulating Image Prompt',
  ],
};

function App() {
  const [showLandingPage, setShowLandingPage] = useState(true); // New state for landing page

  // Feature Navigation State
  const [activeFeature, setActiveFeature] = useState<Feature>('quick');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state

  // AGENT STATE
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [topic, setTopic] = useState<string>('');
  const [scheduleTime, setScheduleTime] = useState<string>('');
  const [tone, setTone] = useState<Tone>('Professional');
  const [audience, setAudience] = useState<Audience>('General Public');
  const [realtimeNews, setRealtimeNews] = useState<NewsArticle[] | null>(null);
  const [pipelineResults, setPipelineResults] = useState<PipelineResults | null>(null);
  const [currentLoadingStep, setCurrentLoadingStep] = useState<number>(0);
  const [currentLoadingPhase, setCurrentLoadingPhase] = useState<LoadingPhase | null>(null);
  const [showNotification, setShowNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(false);

  const displayNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setShowNotification({ message, type });
    setTimeout(() => setShowNotification(null), 5000);
  }, []);

  // Handler to bridge Trending -> Agent
  const handleDraftFromTrend = useCallback((trendTopic: string) => {
    setTopic(trendTopic);
    setActiveFeature('agent');
    setCurrentScreen('home');
    displayNotification(`Drafting content for: ${trendTopic}`, 'info');
  }, [displayNotification]);

  const handleSearchNews = useCallback(async (selectedTopic: string) => {
    setTopic(selectedTopic);
    setRealtimeNews(null);
    setCurrentScreen('loading');
    setCurrentLoadingPhase('news');
    setCurrentLoadingStep(0);
    displayNotification('Searching for real-time news...', 'info');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCurrentLoadingStep(prev => prev + 1);

      const response = await fetch('/api/search-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: selectedTopic }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRealtimeNews(data.news);
      setCurrentScreen('home');
      displayNotification(data.news.length > 0 ? 'Real-time news fetched!' : 'No relevant news found.', 'success');
    } catch (error) {
      console.error('Error fetching real-time news:', error);
      displayNotification(`Failed to fetch news: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      setCurrentScreen('home');
    }
  }, [displayNotification]);

  const handleGenerateContent = useCallback(async (selectedTopic: string, selectedScheduleTime: string, selectedTone: Tone, selectedAudience: Audience, autoGenerateImage: boolean) => {
    setTopic(selectedTopic);
    setScheduleTime(selectedScheduleTime);
    setTone(selectedTone);
    setAudience(selectedAudience);
    setCurrentScreen('loading');
    setCurrentLoadingPhase('content');
    setCurrentLoadingStep(0);
    setPipelineResults(null);
    displayNotification('Generating content pipeline...', 'info');

    const incrementStep = () => setCurrentLoadingStep((prev) => Math.min(prev + 1, loadingSteps.content.length - 1));

    try {
      for (let i = 0; i < loadingSteps.content.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        incrementStep();
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          scheduleTime: selectedScheduleTime,
          tone: selectedTone,
          audience: selectedAudience,
          realtimeNews: realtimeNews,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PipelineResults = await response.json();
      setPipelineResults(data);

      if (data.scheduled && selectedScheduleTime) {
        try {
          const existing = localStorage.getItem('scheduled_posts');
          const posts = existing ? JSON.parse(existing) : [];
          posts.push({
            id: Date.now().toString(),
            title: selectedTopic,
            date: selectedScheduleTime,
            platform: 'LinkedIn'
          });
          localStorage.setItem('scheduled_posts', JSON.stringify(posts));
        } catch (e) { console.error("Auto-save schedule failed", e); }
      }

      setCurrentScreen('results');

      if (data.schedulingMessage) {
        const type = data.scheduled ? 'success' : 'error';
        displayNotification(data.schedulingMessage, type);
      } else {
        displayNotification('Content pipeline generated successfully!', 'success');
      }

      // Auto-generate image if requested
      if (autoGenerateImage && data.image_prompt) {
        handleGenerateImage(data.image_prompt);
      }

    } catch (error) {
      console.error('Error generating content:', error);
      displayNotification(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      setCurrentScreen('home');
    }
  }, [displayNotification, realtimeNews]);

  const handleGenerateImage = useCallback(async (imagePrompt: string) => {
    setIsGeneratingImage(true);
    setIsGlobalLoading(true);
    displayNotification('Generating image...', 'info');
    try {
      const response = await fetch('/api/generate-image-from-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_prompt: imagePrompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPipelineResults(prev => prev ? { ...prev, imageUrl: data.imageUrl } : null);
      displayNotification('Image generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating image:', error);
      displayNotification('Failed to generate image.', 'error');
    } finally {
      setIsGeneratingImage(false);
      setIsGlobalLoading(false);
    }
  }, [displayNotification]);

  const handleSchedulePost = useCallback(async () => {
    if (!scheduleTime) {
      displayNotification('Please select a date and time to schedule.', 'error');
      return;
    }

    setIsScheduling(true);
    setIsGlobalLoading(true);
    displayNotification('Scheduling post...', 'info');
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleTime }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to schedule post');
      }

      try {
        const existing = localStorage.getItem('scheduled_posts');
        const posts = existing ? JSON.parse(existing) : [];
        posts.push({
          id: Date.now().toString(),
          title: topic,
          date: scheduleTime,
          platform: 'LinkedIn'
        });
        localStorage.setItem('scheduled_posts', JSON.stringify(posts));
      } catch (e) {
        console.error("Failed to save schedule locally", e);
      }

      displayNotification(result.message, 'success');

      setPipelineResults(prev => prev ? ({
        ...prev,
        scheduled: true,
        schedulingMessage: result.message
      }) : null);

    } catch (error) {
      console.error('Error scheduling post:', error);
      displayNotification(error instanceof Error ? error.message : 'Failed to schedule post', 'error');
    } finally {
      setIsScheduling(false);
      setIsGlobalLoading(false);
    }
  }, [scheduleTime, displayNotification, topic]);

  const handleBackToHome = useCallback(() => {
    setCurrentScreen('home');
    setTopic('');
    setScheduleTime('');
    setTone('Professional');
    setAudience('General Public');
    setRealtimeNews(null);
    setPipelineResults(null);
    setCurrentLoadingStep(0);
    setCurrentLoadingPhase(null);
  }, []);

  const handleSaveEditedContent = useCallback((updatedResults: PipelineResults) => {
    setPipelineResults(updatedResults);
    displayNotification('Content changes saved successfully!', 'success');
  }, [displayNotification]);

  const currentSteps = currentLoadingPhase === 'news' ? loadingSteps.news : loadingSteps.content;

  const renderMainContent = () => {
    switch (activeFeature) {
      case 'quick':
        return <QuickPostFeature />;
      case 'trending':
        return <TrendingFeature onDraftPost={handleDraftFromTrend} />;
      case 'calendar':
        return <CalendarFeature />;
      case 'settings':
        return <SettingsFeature />;
      case 'agent':
      default:
        return (
          <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl p-5 sm:p-8 md:p-10 border border-gray-100 min-h-[600px] flex flex-col">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 md:mb-12 text-center leading-tight">
              Post With Us Production Agent <span className="block text-xl sm:text-2xl font-light text-blue-600 mt-3">AI-Powered Pipeline Creator</span>
            </h1>

            {currentScreen === 'home' && (
              <HomeView
                onGenerate={handleGenerateContent}
                onSearchNews={handleSearchNews}
                initialTopic={topic}
                initialScheduleTime={scheduleTime}
                initialTone={tone}
                initialAudience={audience}
                realtimeNews={realtimeNews}
                isLoadingNews={currentLoadingPhase === 'news'}
              />
            )}

            {currentScreen === 'loading' && (
              <LoadingView
                steps={currentSteps}
                currentStepIndex={currentLoadingStep}
                phase={currentLoadingPhase}
              />
            )}

            {currentScreen === 'results' && pipelineResults && (
              <ResultsView
                topic={topic}
                results={pipelineResults}
                onGenerateImage={handleGenerateImage}
                onSchedulePost={handleSchedulePost}
                onBackToHome={handleBackToHome}
                onSaveEditedContent={handleSaveEditedContent}
                onNotification={displayNotification}
                isGeneratingImage={isGeneratingImage}
                isScheduling={isScheduling}
              />
            )}
          </div>
        );
    }
  };

  if (showLandingPage) {
    return <LandingPage onGetStarted={() => setShowLandingPage(false)} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans relative">
      <Sidebar
        activeFeature={activeFeature}
        setActiveFeature={setActiveFeature}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 px-4 py-3 flex items-center justify-between z-30 shadow-sm h-16">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center transform -rotate-3">
            <svg className="w-5 h-5 text-white transform rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </div>
          <span className="ml-2 font-bold text-gray-900 text-lg tracking-tight">Post With Us</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto min-h-screen transition-all duration-300">
        {/* Global Notifications */}
        {showNotification && (
          <div
            role="alert"
            className={`fixed top-20 md:top-6 right-4 md:right-6 p-4 rounded-xl shadow-2xl z-[110] flex items-center space-x-3 max-w-xs md:max-w-md animate-fade-in-down border
            ${showNotification.type === 'success' ? 'bg-white border-green-200 text-green-800' : ''}
            ${showNotification.type === 'error' ? 'bg-white border-red-200 text-red-800' : ''}
            ${showNotification.type === 'info' ? 'bg-white border-blue-200 text-blue-800' : ''}`}
          >
            {showNotification.type === 'success' && <div className="p-1 bg-green-100 rounded-full"><svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></div>}
            {showNotification.type === 'error' && <div className="p-1 bg-red-100 rounded-full"><svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></div>}
            {showNotification.type === 'info' && <div className="p-1 bg-blue-100 rounded-full"><svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>}
            <span className="text-sm font-medium">{showNotification.message}</span>
          </div>
        )}

        {/* Global Loading Indicator */}
        {isGlobalLoading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center transform scale-100 animate-fade-in">
              <div className="relative mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
              </div>
              <p className="text-gray-900 font-bold text-lg tracking-wide">Processing</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center">
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
}

export default App;