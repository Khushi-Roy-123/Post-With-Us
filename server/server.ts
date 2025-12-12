import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, FunctionDeclaration, Type, GenerateContentResponse } from "@google/genai";
import fetch from 'node-fetch'; // For mocking image URL or future actual image generation
import type { NewsArticle } from './types'; // Import NewsArticle type
import { db } from './firebase';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for image/video uploads

// Connect to MongoDB
// Connect to MongoDB removed
// Firebase initialized via import

// Ensure API_KEY is set
if (!process.env.API_KEY) {
  console.warn('API_KEY is not set. Gemini API calls will fail.');
}

// Function to initialize GoogleGenAI client (to ensure latest API_KEY is used)
const getGenAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Define the function calling tool for scheduling a post
const schedulePostFunctionDeclaration: FunctionDeclaration = {
  name: 'schedule_post',
  parameters: {
    type: Type.OBJECT,
    description: 'Schedules a content post for a specific date and time.',
    properties: {
      scheduleTime: {
        type: Type.STRING,
        description: 'The exact date and time (ISO 8601 format) to schedule the post.',
      },
    },
    required: ['scheduleTime'],
  },
};

// Mock function to simulate scheduling with validation
const schedule_post = async (scheduleTime: string) => {
  console.log(`[Tool Call] Mock scheduling post for: ${scheduleTime}`);

  const date = new Date(scheduleTime);

  // validation: Invalid Date
  if (isNaN(date.getTime())) {
    return {
      status: 'error',
      message: `Scheduling failed: Invalid date format '${scheduleTime}'.`
    };
  }

  const now = new Date();
  // validation: Past Date
  if (date <= now) {
    return {
      status: 'error',
      message: `Scheduling failed: The time '${date.toLocaleString()}' is in the past. Please choose a future time.`
    };
  }

  // Simulate external service call delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Save to Firebase (if this is called via tool use)
  try {
    if (db) {
      const postRef = db.collection('posts').doc();
      await postRef.set({
        title: "AI Generated Post", // Placeholder
        date: date.toISOString(),
        platform: 'LinkedIn',
        status: 'Scheduled',
        createdAt: new Date().toISOString()
      });
    }
  } catch (e) {
    console.error("Failed to save scheduled post to DB from tool", e);
  }

  return {
    status: 'success',
    message: `Post successfully scheduled for ${date.toLocaleString()} (Mock Service & DB Saved).`
  };
};

// NEW: Get all scheduled posts
// NEW: Get all scheduled posts (Firebase)
app.get('/api/posts', async (req, res) => {
  try {
    if (!db) return res.json([]);

    const snapshot = await db.collection('posts').orderBy('date', 'asc').get();
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// NEW: Update/Delete post endpoints
// NEW: Update/Delete post endpoints (Firebase)
app.put('/api/posts/:id', async (req, res) => {
  try {
    if (!db) throw new Error("DB not initialized");
    await db.collection('posts').doc(req.params.id).update(req.body);
    const updated = await db.collection('posts').doc(req.params.id).get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (e) { res.status(500).json({ error: "Update failed" }); }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    if (!db) throw new Error("DB not initialized");
    await db.collection('posts').doc(req.params.id).delete();
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ error: "Delete failed" }); }
});

// NEW: Backend endpoint for searching real-time news
app.post('/api/search-news', async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  try {
    const ai = getGenAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // gemini-2.5-flash is suitable for text tasks with grounding
      contents: `Current Date: ${new Date().toLocaleDateString()}. Search Google for the latest and most relevant news articles about "${topic}" from the last 24 hours to provide up-to-date real-time context.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const newsArticles: NewsArticle[] = [];

    if (groundingChunks && Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk.web) {
          newsArticles.push({
            title: chunk.web.title || 'No Title',
            uri: chunk.web.uri || '#',
            snippet: (chunk.web as any).snippet || 'No snippet available.',
          });
        }
      }
    }
    // Limit to top 5-7 articles for display
    res.json({ news: newsArticles.slice(0, 7) });

  } catch (error) {
    console.error('Error searching news with Gemini API:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: `Internal server error: ${error.message}` });
    } else {
      res.status(500).json({ error: 'An unknown error occurred with the Gemini API during news search.' });
    }
  }
});


// Backend endpoint for generating content
app.post('/api/generate', async (req, res) => {
  const { topic, scheduleTime, tone, audience, realtimeNews } = req.body; // Destructure tone, audience, AND realtimeNews

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  try {
    const ai = getGenAIClient();
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview', // Using gemini-3-pro-preview for complex tasks and function calling
      config: {
        responseMimeType: "application/json", // Ensure JSON output
        tools: [{ functionDeclarations: [schedulePostFunctionDeclaration] }],
      },
    });

    // Construct news context for the prompt
    let newsContext = '';
    if (realtimeNews && realtimeNews.length > 0) {
      newsContext = '\n\n**REFERENCED REAL-TIME NEWS (Source of Truth):**\n';
      realtimeNews.forEach((article: NewsArticle, index: number) => {
        newsContext += `${index + 1}. Title: ${article.title}\n   Snippet: ${article.snippet}\n   Source: ${article.uri}\n`;
      });
      newsContext += '\nIntegrate these specific news details to make the content timely and relevant.';
    }

    let fullPrompt = `
      You are a World-Class Content Strategist and Copywriter for top brands.
      Your goal is to create high-performing, viral social media content that drives engagement.

      Topic: "${topic}"
      Tone: ${tone}
      Target Audience: ${audience}
      Current System Date: ${new Date().toLocaleString()}
      ${newsContext}

      ## INSTRUCTIONS:
      1. **Viral Hooks**: Generate 3 distinct, attention-grabbing "Hooks" or angles to start the post. These should be scroll-stoppers (e.g., contrarian, question, story-opener).
      2. **Blog Outline**: Create a structured outline (5-7 points) for a blog post.
      3. **LinkedIn Post**: Write a professional yet punchy LinkedIn post (active voice, short paragraphs, max 150 words) based on the best hook.
      4. **Instagram Caption**: Write an engaging caption (max 100 words) with a question for engagement and 5-7 relevant hashtags.
      5. **Short Blog**: Write a high-quality blog post (300-600 words) referencing the news context.
      6. **SEO**: Generate 5-10 high-ranking SEO keywords and a click-worthy Title.
      7. **Image Prompt**: Write a highly detailed, artistic text-to-image prompt. 
         - Style: Photorealistic, Cinematic, or Modern Vector Art (choose best for topic).
         - Include lighting, camera angle, and mood details.
         - *Example*: "A futuristic workspace with holographic displays showing financial data, cinematic lighting, 8k resolution, photorealistic."
      ${scheduleTime ? `8. Call 'schedule_post' tool with: '${scheduleTime}'.` : ''}

      ## OUTPUT FORMAT (JSON ONLY):
      {
        "hooks": ["Hook 1", "Hook 2", "Hook 3"],
        "outline": "string",
        "linkedin": "string",
        "instagram": {
          "caption": "string",
          "hashtags": ["string"]
        },
        "blog": "string",
        "seo_keywords": ["string"],
        "image_prompt": "string",
        "scheduled": boolean
      }
    `;

    // Send message to Gemini with the full prompt
    const result = await chat.sendMessage({ message: fullPrompt });
    const responseText = result.text || '';

    // Check for function calls and handle them
    let scheduled = false;
    let schedulingMessage = '';

    const functionCalls = result.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      for (const fc of functionCalls) {
        if (fc.name === 'schedule_post') {
          const args = fc.args as any;
          const scheduleResult = await schedule_post(args.scheduleTime);
          scheduled = scheduleResult.status === 'success';
          schedulingMessage = scheduleResult.message;

          // Send tool response back to Gemini to update context (optional for final output)
          await chat.sendMessage([
            {
              functionResponse: {
                id: fc.id,
                name: fc.name,
                response: { result: scheduleResult },
              },
            },
          ] as any);
        }
      }
    }

    // Parse the JSON output from Gemini
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
      parsedResult.scheduled = scheduled; // Add scheduling status to the final output
      // Add the specific message from the tool for frontend display
      if (schedulingMessage) {
        parsedResult.schedulingMessage = schedulingMessage;
      }
    } catch (e) {
      console.error('Failed to parse Gemini response as JSON:', responseText, e);
      return res.status(500).json({ error: 'Failed to parse content from AI. Response was not valid JSON.' });
    }

    res.json(parsedResult);

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: `Internal server error: ${error.message}` });
    } else {
      res.status(500).json({ error: 'An unknown error occurred with the Gemini API.' });
    }
  }
});

// Mock endpoint for generating an image from a prompt
app.post('/api/generate-image-from-prompt', async (req, res) => {
  const { image_prompt } = req.body;
  if (!image_prompt) {
    return res.status(400).json({ error: 'Image prompt is required.' });
  }

  // In a real app, you would integrate with an actual image generation API (e.g., Gemini Image or another service)
  // For this mock, we'll return a placeholder image based on the prompt.
  // Using picsum.photos for a random image with dimensions.
  const width = 800;
  const height = 600;
  const seed = Math.floor(Math.random() * 1000); // Use a seed for variety
  const imageUrl = `https://picsum.photos/${width}/${height}?random=${seed}`;

  res.json({
    imageUrl: imageUrl,
    message: 'Image generated (mock) successfully based on the prompt.',
  });
});

// New Endpoint: Manual Schedule
app.post('/api/schedule', async (req, res) => {
  const { scheduleTime } = req.body;
  if (!scheduleTime) {
    return res.status(400).json({ status: 'error', message: 'Schedule time is required.' });
  }

  // Save to DB via manual endpoint
  // Save to Firebase via manual endpoint
  try {
    const { title, platform, status, contentSnippet } = req.body;

    let newId = 'temp_' + Date.now();

    if (db) {
      const postRef = db.collection('posts').doc();
      newId = postRef.id;
      await postRef.set({
        title: title || "Scheduled Post",
        date: scheduleTime,
        platform: platform || "LinkedIn",
        status: status || "Scheduled",
        contentSnippet,
        createdAt: new Date().toISOString()
      });
    }

    const result = await schedule_post(scheduleTime); // Keep mock service call logic
    res.json({ ...result, id: newId });

  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Database save failed' });
  }
});

// NEW: Quick Post Endpoint with Multimodal Support
app.post('/api/quick-post', async (req, res) => {
  const { content, platform, media } = req.body;

  if (!content && (!media || media.length === 0)) {
    return res.status(400).json({ error: 'Content or media is required.' });
  }

  try {
    const ai = getGenAIClient();
    const parts: any[] = [];

    // Add text instructions
    const promptText = `
      You are a social media expert. Write a punchy, engaging post for ${platform || 'social media'}.
      ${content ? `Based on this text input: "${content}"` : 'Based on the attached media.'}
      Keep it appropriate for the platform (e.g., professional for LinkedIn, short for Twitter).
      Include emojis if appropriate. Do not explain, just return the post text.
    `;

    parts.push({ text: promptText });

    // Add media parts if available
    if (media && Array.isArray(media)) {
      media.forEach((m: { data: string, mimeType: string }) => {
        parts.push({
          inlineData: {
            data: m.data,
            mimeType: m.mimeType
          }
        });
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts }],
    });

    res.json({ post: response.text });
  } catch (error) {
    console.error('Error generating quick post:', error);
    res.status(500).json({ error: 'Failed to generate quick post.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});