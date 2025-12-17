import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Using global fetch (Node 18+)
import type { NewsArticle } from './types';

// Fix for missing global fetch type in older TS setups
declare const fetch: any;

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// CSP Fix: Explicitly set permissive CSP to avoid default 'none' issues in some environments
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.setHeader("Content-Security-Policy", "default-src 'self' * 'unsafe-inline' 'unsafe-eval' data: blob:");
  next();
});

// Ensure API_KEY is set
if (!process.env.API_KEY) {
  console.warn('API_KEY is not set. OpenRouter API calls will fail.');
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const SITE_URL = "http://localhost:3000"; // Optional: Your app's URL
const SITE_NAME = "Post-With-Us"; // Optional: Your app's name

// Google Trends optional integration
let googleTrends: any;
let googleTrendsNormalized: any;
try {
  // Use require here to avoid TypeScript type errors if the package isn't installed
  googleTrends = require('google-trends-api');
  // Normalize default export shape (some bundlers put exports on .default)
  googleTrendsNormalized = googleTrends.default || googleTrends;
  console.log('google-trends-api loaded. available keys:', Object.keys(googleTrendsNormalized || {}));
} catch (e) {
  console.warn('google-trends-api is not installed; /api/trends endpoint will be disabled.');
}

// Helper to safely parse JSON or extract JSON from HTML-wrapped responses
function safeParseJSON(raw: any) {
  if (typeof raw !== 'string') return raw;

  // Quick check for valid JSON start
  const firstChar = raw.trim()[0];
  if (firstChar === '{' || firstChar === '[') {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // continue to fallback
    }
  }

  // Try to extract first JSON object/array inside an HTML document
  const match = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (match && match[0]) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      // fallthrough
    }
  }

  // Unable to parse - capture a short diagnostic snippet and throw a descriptive error
  const snippet = raw.slice(0, 1200);
  console.error('safeParseJSON: failed to parse raw response. snippet:', snippet);
  const err: any = new Error('Failed to parse JSON from Google Trends response');
  err.snippet = snippet;

  // Save a reference globally so the response builder can surface it for diagnostics (best-effort)
  try { (global as any).__lastGoogleTrendsError = err; } catch (ignore) {}

  throw err;
}

let inMemoryPosts: any[] = [];

// Filtering: remove teen/minor content and abusive content from trending sources
const TEEN_FILTER_KEYWORDS = [
  'teen', 'teens', 'teenager', 'teenagers', 'minor', 'under 18', 'underage', 'youth',
  'r/teenagers', 'r/teens', 'r/teen'
];

// Abuse/profanity keywords (non-exhaustive). Add more terms as needed.
const ABUSE_FILTER_KEYWORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'damn', 'kill', 'rape', 'suicide', 'abuse', 'terror', 'bomb', 'molest'
];

function containsDisallowedContent(obj: any) {
  const combined = [
    obj.topic || obj.title || '',
    obj.category || '',
    obj.url || '',
    (obj.articles || []).map((a: any) => (a.title || '') + ' ' + (a.url || '')).join(' ')
  ].join(' ').toLowerCase();

  const reasons: string[] = [];
  if (TEEN_FILTER_KEYWORDS.some(k => combined.includes(k))) reasons.push('teen');
  if (ABUSE_FILTER_KEYWORDS.some(k => combined.includes(k))) reasons.push('abuse');

  return { isDisallowed: reasons.length > 0, reasons };
}

// Helper to call OpenRouter
async function callOpenRouter(model: string, messages: any[], tools?: any[], jsonMode: boolean = false, isImageGen: boolean = false): Promise<any> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.API_KEY}`,
      "HTTP-Referer": SITE_URL,
      "X-Title": SITE_NAME,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      tools: tools,
      response_format: tools ? undefined : (jsonMode ? { type: "json_object" } : undefined),
      modalities: isImageGen ? ["image", "text"] : undefined
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Mock function to simulate scheduling
const schedule_post = async (scheduleTime: string) => {
  console.log(`[Tool Call] Mock scheduling post for: ${scheduleTime}`);
  const date = new Date(scheduleTime);

  if (isNaN(date.getTime())) {
    return { status: 'error', message: `Scheduling failed: Invalid date format '${scheduleTime}'.` };
  }

  const now = new Date();
  if (date <= now) {
    return { status: 'error', message: `Scheduling failed: '${date.toLocaleString()}' is in the past.` };
  }

  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Save to In-Memory Array
  const newPost = {
    id: 'auto_' + Date.now(),
    title: "AI Generated Post",
    date: date.toISOString(),
    platform: 'LinkedIn',
    status: 'Scheduled',
    createdAt: new Date().toISOString()
  };
  inMemoryPosts.push(newPost);

  return {
    status: 'success',
    message: `Post successfully scheduled for ${date.toLocaleString()} (Mock Service & In-Memory Saved).`
  };
};

// --- ENDPOINTS ---

// Root Status Route
app.get('/', (req: express.Request, res: express.Response) => {
  res.send('<h1>Server is running! 🚀</h1><p>API endpoints are at <code>/api/...</code></p>');
});

app.get('/api/posts', async (req: express.Request, res: express.Response) => {
  // Return sorted posts
  const sorted = [...inMemoryPosts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  res.json(sorted);
});

app.put('/api/posts/:id', async (req: express.Request, res: express.Response) => {
  const idx = inMemoryPosts.findIndex(p => p.id === (req.params as any).id);
  if (idx === -1) return res.status(404).json({ error: "Post not found" });

  inMemoryPosts[idx] = { ...inMemoryPosts[idx], ...(req.body as any) };
  res.json(inMemoryPosts[idx]);
});

app.delete('/api/posts/:id', async (req: express.Request, res: express.Response) => {
  inMemoryPosts = inMemoryPosts.filter(p => p.id !== (req.params as any).id);
  res.json({ message: "Deleted" });
});

// NEWS SEARCH (Note: Google Search Grounding is not standard in OpenRouter. 
// We will attempt a generic prompt approach or return a placeholder if not supported.)
app.post('/api/search-news', async (req: express.Request, res: express.Response) => {
  const { topic } = (req.body as any);
  if (!topic) return res.status(400).json({ error: 'Topic is required.' });
});

// Trends endpoint (uses google-trends-api if available)
app.get('/api/trends', async (req: express.Request, res: express.Response) => {
  const geo = (req.query as any).geo as string || 'US';
  try {
    if (!googleTrendsNormalized) return res.status(501).json({ error: 'Google Trends integration not available on server.' });

    // Try dailyTrends, realTimeTrends, or interestOverTime in that order
    let raw: any;
    let parsed: any;
    const items: any[] = [];
    let warning: string | null = null;

    try {
      if (typeof googleTrendsNormalized.dailyTrends === 'function') {
        raw = await googleTrendsNormalized.dailyTrends({ geo });
        parsed = safeParseJSON(raw);

        const days = parsed.default?.trendingSearchesDays || parsed.trendingSearchesDays || [];
        for (const day of days) {
          if (!day.trendingSearches) continue;
          for (const t of day.trendingSearches) {
            const titleObj = t.title || {};
            const topic = titleObj.query || titleObj.title || (typeof t === 'string' ? t : undefined) || 'Unknown';
            const volume = t.formattedTraffic || '';
            const articles = t.articles || [];
            items.push({ topic, volume, articles });
          }
        }
      } else if (typeof googleTrendsNormalized.realTimeTrends === 'function') {
        raw = await googleTrendsNormalized.realTimeTrends({ geo, category: 'all', hl: 'en-US' });
        parsed = safeParseJSON(raw);
        // realTimeTrends has storySummaries, with trendingStories array
        const stories = parsed.storySummaries?.trendingStories || parsed.trendingStories || [];
        for (const s of stories) {
          const topic = s.title || s.storyTitle || (s.articles && s.articles[0] && (s.articles[0].title || s.articles[0].articleTitle)) || 'Unknown';
          const articles = s.articles || [];
          items.push({ topic, volume: '', articles });
        }
      } else if (typeof googleTrendsNormalized.interestOverTime === 'function') {
        // As a last fallback, use interestOverTime for a few popular keywords
        const keywords = ['news', 'technology', 'business'];
        raw = await googleTrendsNormalized.interestOverTime({ keyword: keywords, startTime: new Date(Date.now() - 24 * 60 * 60 * 1000) });
        parsed = safeParseJSON(raw);
        // Parse interestOverTime object to create topics
        if (parsed.default && parsed.default.timelineData) {
          const timeline = parsed.default.timelineData;
          // Use keywords provided in request or default mapping
          keywords.forEach((k, i) => items.push({ topic: k, volume: '', articles: [] }));
        }
      } else {
        console.warn('google-trends-api loaded but missing dailyTrends/realTimeTrends/interestOverTime. keys=', Object.keys(googleTrendsNormalized || {}));
        return res.status(501).json({ error: 'Google Trends client missing supported functions.' });
      }
    } catch (e: any) {
      console.error('Error fetching/parsing Google Trends data:', e);

      // Provide more informative warning/diagnostics to the client
      let diagnosticSnippet: string | null = null;
      if (e && e.message && typeof e.message === 'string' && e.message.includes('Failed to parse JSON from Google Trends response')) {
        // safeParseJSON already logged a longer snippet; capture a short version here
        try {
          diagnosticSnippet = (e as any).snippet || null;
        } catch (ignore) {
          diagnosticSnippet = null;
        }
      }

      warning = 'Failed to fetch live trends from Google Trends; showing fallback examples. See diagnostics for details.';

      // Graceful fallback sample trends
      const fallback = [
        { topic: 'Artificial General Intelligence', volume: '2.4M posts', articles: [] },
        { topic: 'Sustainable Urban Farming', volume: '850K posts', articles: [] },
        { topic: 'Mars Colonization Update', volume: '1.2M posts', articles: [] },
        { topic: 'Global Digital Currency', volume: '3.1M posts', articles: [] },
        { topic: 'Retro Tech Nostalgia', volume: '500K posts', articles: [] },
        { topic: 'Quantum Internet', volume: '900K posts', articles: [] },
      ];

      fallback.forEach(f => items.push({ topic: f.topic, volume: f.volume, articles: f.articles }));

      // Attach diagnostic snippet to response via a property on the error, so we can expose it below
      (e as any)._diagnosticSnippet = diagnosticSnippet || null;
    }

    // Deduplicate by topic and limit to top 20
    const seen = new Set();
    const deduped = items.filter(it => {
      if (seen.has(it.topic)) return false;
      seen.add(it.topic);
      return true;
    }).slice(0, 20);

    const mapped = deduped.map((it, idx) => ({ id: idx + 1, topic: it.topic, category: 'Trending', volume: it.volume || '', growth: '', articles: it.articles || [] }));

    // Include warning message and diagnostics if we fell back
    const responsePayload: any = { trends: mapped };
    if (warning) responsePayload.warning = warning;

    // Attach diagnostic snippet from the last saved error if available
    try {
      const lastErr = (global as any).__lastGoogleTrendsError;
      if (lastErr && lastErr.snippet) {
        responsePayload.diagnosticSnippet = String(lastErr.snippet).slice(0, 1000);
      }
    } catch (e) {
      // ignore
    }

    res.json(responsePayload);
  } catch (error: any) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends from Google Trends.' });
  }
});

// continue existing search-news handler implementation
app.post('/api/search-news', async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required.' });

  try {
    // Attempting a pseudo-search via LLM knowledge (fallback) since Grounding tool is specific to Google Vertex/AI Studio
    // Ideally, you would use a separate Search API (Serper, Bing, etc.) here.
    // For now, we will ask the LLM to recall recent events if possible, or warn.
    const messages = [
      {
        role: "system",
        content: `You are a news aggregator. Retrieve or simulate the top 5 recent news headlines relevant to the topic. 
        Format as a JSON list of objects with 'title', 'uri' (use a dummy URL if unknown), and 'snippet'.
        Disclaimer: If you cannot access real-time internet, generate plausible examples labeled as [Simulated News].`
      },
      { role: "user", content: `Topic: ${topic}. Current Date: ${new Date().toLocaleDateString()}` }
    ];

    const data: any = await callOpenRouter("openai/gpt-3.5-turbo", messages, undefined, true);
    const content = data.choices[0]?.message?.content;

    let newsArticles: NewsArticle[] = [];
    try {
      // Try to parse JSON from the content
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        newsArticles = JSON.parse(jsonMatch[0]);
      } else {
        newsArticles = JSON.parse(content);
      }
    } catch (e) {
      console.warn("Failed to parse news JSON", e);
      // Fallback
      newsArticles.push({ title: "Could not fetch real-time news", snippet: "Please try again later or check your API configuration.", uri: "#" });
    }

    res.json({ news: newsArticles.slice(0, 7) });
  } catch (error: any) {
    console.error('Error searching news:', error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
});

app.post('/api/generate', async (req, res) => {
  const { topic, scheduleTime, tone, audience, realtimeNews } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required.' });

  try {
    let newsContext = '';
    if (realtimeNews && realtimeNews.length > 0) {
      newsContext = '\n\n**REFERENCED REAL-TIME NEWS (Source of Truth):**\n';
      realtimeNews.forEach((article: NewsArticle, index: number) => {
        newsContext += `${index + 1}. Title: ${article.title}\n   Snippet: ${article.snippet}\n   Source: ${article.uri}\n`;
      });
      newsContext += '\nIntegrate these specific news details to make the content timely and relevant.';
    }

    const systemPrompt = `You are a World-Class Content Strategist.
    Goal: Create viral social media content.
    Result MUST be valid JSON.
    
    JSON Schema:
    {
      "hooks": ["string"],
      "outline": "string",
      "linkedin": "string",
      "instagram": { "caption": "string", "hashtags": ["string"] },
      "blog": "string",
      "seo_keywords": ["string"],
      "scheduled": boolean,
      "schedulingMessage": "string (optional)"
    }`;

    const userPrompt = `
      Topic: "${topic}"
      Tone: ${tone}
      Target Audience: ${audience}
      Current Date: ${new Date().toLocaleString()}
      ${newsContext}

      INSTRUCTIONS:
      1. Viral Hooks (3 distinct angles)
      2. Blog Outline (5-7 points)
      3. LinkedIn Post (Professsional, punchy)
      4. Instagram Caption (Engaging + hashtags)
      5. Short Blog (300-600 words)
      6. SEO Keywords (5-10)
      ${scheduleTime ? `7. Call 'schedule_post' tool with: '${scheduleTime}' ONLY IF explicitly requested.` : ''}
    `;

    // Tool Definition for Scheduling
    const tools = [
      {
        type: "function",
        function: {
          name: "schedule_post",
          description: "Schedules a content post for a specific date and time.",
          parameters: {
            type: "object",
            properties: {
              scheduleTime: {
                type: "string",
                description: "The exact date and time (ISO 8601 format) to schedule the post."
              }
            },
            required: ["scheduleTime"]
          }
        }
      }
    ];

    // First call to the model
    let messages: any[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    // If scheduling is requested, include the tool. Otherwise, don't, to save tokens/complexity.
    // Actually, we'll just always provide it if scheduleTime is present in context, 
    // but the prompt logic handles the trigger.
    const useTools = !!scheduleTime;

    // Note: 'openai/gpt-3.5-turbo' on OpenRouter behaves like OpenAI Chat
    const completion = await callOpenRouter("openai/gpt-3.5-turbo", messages, useTools ? tools : undefined, true) as any;

    let responseMessage = completion.choices[0].message;
    let scheduled = false;
    let schedulingMessage = '';

    // Handle Function Call
    if (responseMessage.tool_calls) {
      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.function.name === 'schedule_post') {
          const args = JSON.parse(toolCall.function.arguments);
          const scheduleResult = await schedule_post(args.scheduleTime);
          scheduled = scheduleResult.status === 'success';
          schedulingMessage = scheduleResult.message;

          // Append tool result to messages
          messages.push(responseMessage);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: JSON.stringify(scheduleResult)
          });
        }
      }

      // Follow-up call to get final JSON
      const finalCompletion = await callOpenRouter("openai/gpt-3.5-turbo", messages, undefined, true) as any;
      responseMessage = finalCompletion.choices[0].message;
    }

    // Parse JSON
    let content = responseMessage.content;
    // Strip markdown code blocks if present
    content = content.replace(/```json\n?|\n?```/g, '');

    const parsedResult = JSON.parse(content);
    parsedResult.scheduled = scheduled; // ensure truth
    if (schedulingMessage) parsedResult.schedulingMessage = schedulingMessage;

    res.json(parsedResult);

  } catch (error: any) {
    console.error('Error in /api/generate:', error);
    res.status(500).json({ error: `Generation failed: ${error.message}` });
  }
});

app.post('/api/quick-post', async (req, res) => {
  const { content, platform, media, documents } = req.body;
  if (!content && (!media || media.length === 0) && (!documents || documents.length === 0)) {
    return res.status(400).json({ error: 'Content, media, or documents are required.' });
  }

  try {
    const messages: any[] = [
      {
        role: "system",
        content: `You are a social media expert. Write a punchy post for ${platform || 'social media'}. No explanation.`
      }
    ];

    const userContent: any[] = [];
    if (content) userContent.push({ type: "text", text: content });

    if (documents && Array.isArray(documents)) {
      documents.forEach((doc: { name: string, content: string }) => {
        userContent.push({
          type: "text",
          text: `\n[ATTACHED DOCUMENT: ${doc.name}]\n${doc.content}\n[END DOCUMENT]\n`
        });
      });
    }

    if (media && Array.isArray(media)) {
      media.forEach((m: { data: string, mimeType: string }) => {
        userContent.push({
          type: "image_url",
          image_url: {
            url: `data:${m.mimeType};base64,${m.data}`
          }
        });
      });
    }

    messages.push({ role: "user", content: userContent });

    const data = await callOpenRouter("openai/gpt-3.5-turbo", messages, undefined, false) as any;
    const postText = data.choices?.[0]?.message?.content || "Could not generate post.";

    res.json({ post: postText });

  } catch (error: any) {
    console.error('Error generating quick post:', error);
    res.status(500).json({ error: 'Failed to generate quick post.' });
  }
});



app.post('/api/schedule', async (req: express.Request, res: express.Response) => {
  const { scheduleTime, title, platform, status, contentSnippet } = (req.body as any);
  if (!scheduleTime) return res.status(400).json({ status: 'error', message: 'Time required.' });

  try {
    let newId = 'temp_' + Date.now();
    // Save to In-Memory
    const newPost = {
      id: newId,
      title: title || "Scheduled Post",
      date: scheduleTime,
      platform: platform || "LinkedIn",
      status: status || "Scheduled",
      contentSnippet,
      createdAt: new Date().toISOString()
    };
    inMemoryPosts.push(newPost);

    const result = await schedule_post(scheduleTime);
    res.json({ ...result, id: newId });
  } catch (e) {
    res.status(500).json({ status: 'error', message: 'Save failed' });
  }
});

// Trending posts via Reddit (no API key needed) - falls back to sample data on failure
app.get('/api/trending-posts', async (req: express.Request, res: express.Response) => {
  try {
    const resp = await fetch('https://www.reddit.com/r/popular.json?limit=25', { headers: { 'User-Agent': 'Post-With-Us/1.0' } });
    if (!resp.ok) throw new Error(`Reddit responded ${resp.status}`);
    const json = await resp.json();
    const children = json?.data?.children || [];
    const posts = children.map((c: any, i: number) => {
      const p = c.data || {};
      return {
        id: p.id || `r_${i}`,
        topic: p.title || 'Untitled',
        category: p.subreddit_name_prefixed || 'reddit',
        volume: p.score ? `${p.score} pts` : '',
        growth: '',
        url: p.url || `https://reddit.com${p.permalink || ''}`,
        articles: [{ url: p.url || `https://reddit.com${p.permalink || ''}`, title: p.title }]
      };
    });

    if (posts.length === 0) throw new Error('No posts returned');

    // Apply content filter (default: enabled). Client can pass ?filterContent=false to bypass.
    const filterContent = (req.query as any).filterContent !== 'false';
    let returned = posts;
    const filteredCounts = { total: 0, teen: 0, abuse: 0 };

    if (filterContent) {
      const filteredOut: any[] = [];
      returned = posts.filter((p: any) => {
        const { isDisallowed, reasons } = containsDisallowedContent(p);
        if (isDisallowed) {
          filteredOut.push(p);
          reasons.forEach(r => {
            if (r === 'teen') filteredCounts.teen++;
            if (r === 'abuse') filteredCounts.abuse++;
          });
          return false;
        }
        return true;
      });
      filteredCounts.total = filteredOut.length;
    }

    const payload: any = { posts: returned };
    if (filteredCounts.total > 0) payload.filteredCounts = filteredCounts;
    if (!filterContent) payload.filterBypassed = true;

    res.json(payload);
  } catch (e: any) {
    console.error('Error fetching trending posts:', e);
    // Fallback sample posts
    const fallback = [
      { id: '1', topic: 'Artificial General Intelligence', category: 'Technology', volume: '2.4M', articles: [] },
      { id: '2', topic: 'Sustainable Urban Farming', category: 'Environment', volume: '850K', articles: [] },
      { id: '3', topic: 'Mars Colonization Update', category: 'Science', volume: '1.2M', articles: [] }
    ];
    res.json({ posts: fallback, warning: 'Failed to fetch live trending posts; showing examples.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});