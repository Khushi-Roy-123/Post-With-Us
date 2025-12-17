import React, { useState } from 'react';

interface TrendingFeatureProps {
    onDraftPost?: (topic: string) => void;
}

export const TrendingFeature: React.FC<TrendingFeatureProps> = ({ onDraftPost }) => {
    const [loading, setLoading] = useState(false);
    const [trends, setTrends] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchTrends = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('http://localhost:3001/api/trending-posts');
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const data = await res.json();
            if (data && data.posts) {
                // map posts to existing UI shape
                const mapped = data.posts.map((p: any, i: number) => ({
                    id: p.id || i,
                    topic: p.topic || p.title || 'Untitled',
                    category: p.category || 'Trending',
                    volume: p.volume || '',
                    growth: p.growth || '',
                    articles: p.articles || (p.url ? [{ url: p.url, title: p.topic }] : [])
                }));
                setTrends(mapped);
                if (data.warning) setError(data.warning + (data.diagnosticSnippet ? ` — diagnostic: ${data.diagnosticSnippet}` : ''));
            } else {
                setError('No trends returned');
            }
        } catch (e: any) {
            console.error('Failed to fetch trends', e);
            setError('Failed to fetch trends');
            // Fallback: keep previous trends or empty
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchTrends();
    }, []);

    const handleRefresh = () => {
        fetchTrends();
    };

    const handleDraft = (topic: string) => {
        if (onDraftPost) {
            onDraftPost(topic);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Trending Now</h2>
                    <p className="text-gray-500">Discover what the world is talking about and join the conversation.</p>
                    {error && (
                        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleRefresh}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm flex items-center transition-colors"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Refreshing...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12c0 1.577.538 3.037 1.442 4.26M19 19v-5h-.581m-15.356-2A8.001 8.001 0 0120 12c0-1.577-.538-3.037-1.442-4.26"></path></svg>
                            Refresh Trends
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trends.map((trend) => (
                    <div key={trend.id} className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300 overflow-hidden group flex flex-col h-full">
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold uppercase tracking-wide">
                                    {trend.category}
                                </span>
                                <span className="text-green-500 font-bold text-sm flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7h1v10l2.5-2.5L18 17l1-1-3.5-3.5L18 10h-6V7zM6 10H5v7h3.5l-2.5-2.5L8 17l1-1-3.5-3.5L3 10zM12 3a1 1 0 011 1v2h-2V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    {trend.growth}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                {trend.topic}
                            </h3>
                            <p className="text-sm text-gray-400 mb-3 flex-1">{trend.volume}</p>

                            {trend.articles && trend.articles.length > 0 && (
                                <div className="mb-4 text-sm text-gray-500">
                                    {trend.articles.slice(0, 2).map((a: any, i: number) => (
                                        <a key={i} href={a.url || a.articleUrl || a.link || '#'} target="_blank" rel="noreferrer" className="block hover:underline">
                                            {a.title || a.articleTitle || a.titleNoFormatting || a.source || 'Read more'}
                                        </a>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => handleDraft(trend.topic)}
                                className="w-full py-2 bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-200 hover:bg-blue-600 hover:text-white hover:border-transparent transition-all duration-200"
                            >
                                Draft Post
                            </button>
                        </div>
                        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </div>
                ))}
            </div>


        </div>
    );
};