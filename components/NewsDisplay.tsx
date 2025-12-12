import React from 'react';
import { NewsArticle } from '../types';

interface NewsDisplayProps {
  news: NewsArticle[] | null;
  isLoading: boolean;
}

export const NewsDisplay: React.FC<NewsDisplayProps> = ({ news, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-600">
        <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg">Fetching latest news...</p>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500 h-full">
        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        <p className="text-lg font-medium">No real-time news available for this topic.</p>
        <p className="text-sm text-gray-400 mt-1">Try a different topic or generate content without news.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
      {news.map((article, index) => (
        <a
          key={index}
          href={article.uri}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 group"
          aria-label={`Read more about ${article.title}`}
        >
          <h3 className="text-md font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 mb-1 leading-tight">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{article.snippet}</p>
          <span className="text-xs text-blue-500 group-hover:underline">Read more &rarr;</span>
        </a>
      ))}
    </div>
  );
};
