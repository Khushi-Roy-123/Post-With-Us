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
app.use((req, res, next) => {
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

// IN-MEMORY STORAGE (Replaces Firebase)
let inMemoryPosts: any[] = [];

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
app.get('/', (req, res) => {
  res.send('<h1>Server is running! 🚀</h1><p>API endpoints are at <code>/api/...</code></p>');
});

app.get('/api/posts', async (req, res) => {
  // Return sorted posts
  const sorted = [...inMemoryPosts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  res.json(sorted);
});

app.put('/api/posts/:id', async (req, res) => {
  const idx = inMemoryPosts.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Post not found" });

  inMemoryPosts[idx] = { ...inMemoryPosts[idx], ...req.body };
  res.json(inMemoryPosts[idx]);
});

app.delete('/api/posts/:id', async (req, res) => {
  inMemoryPosts = inMemoryPosts.filter(p => p.id !== req.params.id);
  res.json({ message: "Deleted" });
});

// NEWS SEARCH (Note: Google Search Grounding is not standard in OpenRouter. 
// We will attempt a generic prompt approach or return a placeholder if not supported.)
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
      "image_prompt": "string",
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
      7. Image Prompt (Detailed, artistic)
      ${scheduleTime ? `8. Call 'schedule_post' tool with: '${scheduleTime}' ONLY IF explicitly requested.` : ''}
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

// Image Gen Mock
app.post('/api/generate-image-from-prompt', async (req, res) => {
  const { image_prompt } = req.body;
  if (!image_prompt) return res.status(400).json({ error: 'Image prompt is required.' });

  try {
    const messages = [
      { role: "user", content: `Generate an image for: ${image_prompt}` }
    ];

    // Call OpenRouter with image generation enabled (using SDXL which is often more accessible)
    const data = await callOpenRouter("stabilityai/stable-diffusion-xl-base-1.0", messages, undefined, false, true) as any;

    // Extract image URL from content (DALL-E 3 often returns a Markdown image link or direct URL)
    let content = data.choices?.[0]?.message?.content || "";
    let imageUrl = content;

    // specific parsing if it comes as markdown ![alt](url)
    const markdownRegex = /!\[.*?\]\((https?:\/\/.*?)\)/;
    const match = content.match(markdownRegex);
    if (match && match[1]) {
      imageUrl = match[1];
    } else if (data.data && data.data[0] && data.data[0].url) {
      // Standard OpenAI format fallback if OpenRouter proxies it that way
      imageUrl = data.data[0].url;
    }

    if (!imageUrl) {
      throw new Error('No image URL found in response');
    }

    res.json({
      imageUrl: imageUrl,
      message: 'Image generated successfully.'
    });

  } catch (error: any) {
    console.error('Error generating image:', error);
    if (error.response) {
      const text = await error.response.text().catch(() => 'No response body');
      console.error('OpenRouter Error Body:', text);
    }
    res.status(500).json({ error: `Image generation failed: ${error.message}` });
  }
});

app.post('/api/schedule', async (req, res) => {
  const { scheduleTime, title, platform, status, contentSnippet } = req.body;
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});