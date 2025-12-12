# Post With Us - AI Content Production Platform

**Post With Us** is a comprehensive, AI-powered content orchestration platform designed for creators and marketers. It streamlines the entire content lifecycle—from idea generation and trend discovery to creation, scheduling, and analytics—leveraging the power of the Google Gemini API.

## Project Structure

The project is structured into a modern frontend (React + Vite + Tailwind CSS) and a backend (Node.js + Express).

```
.
├── public/                # Static assets
├── src/
│   ├── components/        # Feature-rich UI components (Calendar, Analytics, Agent, etc.)
│   ├── types.ts           # Shared TypeScript type definitions
│   ├── App.tsx            # Main application layout and routing logic
│   └── index.tsx          # Entry point
├── server/
│   ├── package.json       # Backend dependencies
│   ├── server.ts          # Express server with Gemini API integration
│   └── tsconfig.json      # Backend TS config
├── AGENT_PROMPT.md        # Detailed System Instructions for the Gemini Agent
├── metadata.json          # App metadata
└── package.json           # Frontend dependencies
```

## 🚀 Key Features

### 1. 🏠 Landing Page & Branding
*   **Engaging Hero Section:** Dynamic background imagery with "Post With Us" branding.
*   **Feature Overview:** Clear introduction to the platform's capabilities.
*   **Detailed Footer:** Navigation, resources, and social links.

### 2. 🤖 AI Pipeline Agent (Core)
*   **Multi-Step Generation:** Generates a complete content suite from a single topic:
    *   Detailed Blog Outline
    *   Professional LinkedIn Post
    *   Engaging Instagram Caption + Hashtags
    *   Short Blog Article
    *   SEO Keywords & Title Strategy
    *   AI Image Prompt
*   **Real-Time News Integration:** Fetches live news via Google Search Grounding to ensure content is topical and up-to-date.
*   **Customization:** Configurable **Tone** (Professional, Witty, Casual, etc.) and **Target Audience**.
*   **Draft Mode:** Auto-saves progress locally; restore or discard drafts anytime.
*   **Editable Results:** Full rich-text editing for all generated content before finalizing.
*   **Export:** Download the entire pipeline as a JSON file.
*   **Mock Image Generation:** Generates visualization previews based on the AI prompt.

### 3. 📅 Smart Content Calendar
*   **Visual Planning:** Monthly view of all scheduled, published, and draft posts.
*   **Drag-and-Drop:** Easily reschedule posts by dragging them to new dates.
*   **Quick Add:** Create draft placeholders directly on the calendar.
*   **Post Management:** Edit details, change status, or delete posts via a modal interface.
*   **Platform Indicators:** Visual cues for different platforms (LinkedIn, Twitter, Instagram, etc.).

### 4. ⚡ Quick Post Creator
*   **Multimodal Input:** Generate posts from text, images, or videos.
*   **Platform Optimization:** Tailors output specifically for Twitter, LinkedIn, Facebook, or Instagram.
*   **Drag & Drop Upload:** Intuitive interface for media handling.
*   **One-Click Copy:** Quickly copy generated captions to clipboard.

### 5. 📈 Trending Now
*   **Trend Discovery:** View simulated trending topics across various categories (Tech, Environment, Finance).
*   **Direct Drafting:** Click "Draft Post" on any trend to immediately send it to the Pipeline Agent for content generation.
*   **Live Updates:** Simulated refresh mechanism to view shifting trends.

### 6. 📊 Analytics Dashboard
*   **Performance Overview:** Track Total Views, Engagement Rate, and Follower Growth.
*   **Hall of Fame:** Highlights top-performing content (Most Viewed, Liked, Shared).
*   **Visual Charts:** Engagement overview bar charts and audience demographics.
*   **Recent Posts:** Table view of recent content status and metrics.

### 7. ⚙️ Settings & Integrations
*   **User Profile:** Manage display name and plan details.
*   **Defaults:** Set global default Tone and Audience preferences.
*   **Social Integrations:** Mock interface to connect/disconnect social accounts (LinkedIn, Twitter, etc.).

## 📲 Installing as an App (PWA)

This project is configured as a **Progressive Web App (PWA)**.
1.  **Deployment:** Once deployed to a live URL (see below).
2.  **Installation:**
    *   **Desktop (Chrome/Edge):** Click the "Install" icon in the right side of the URL bar.
    *   **Mobile (iOS):** Open in Safari -> Tap Share -> "Add to Home Screen".
    *   **Mobile (Android):** Open in Chrome -> Tap Menu -> "Install App".
3.  **Result:** The app will launch in its own standalone window, appearing just like a native application on your device.

## ☁️ Deployment Guide

Since this app has both a Frontend (React) and a Backend (Node/Express), they are best deployed as two separate services, or on a platform that supports both.

### Option 1: Render.com (Easiest for Full Stack)
1.  Push this code to a GitHub repository.
2.  Create a **Web Service** on Render connected to your repo.
3.  **Root Directory:** `server`
4.  **Build Command:** `npm install && npm run build` (Note: You may need to adjust this to build the frontend assets into the backend's public folder for a unified deploy).
5.  **Start Command:** `npm start`
6.  **Environment Variables:** Add `API_KEY`.

### Option 2: Split Deployment (Recommended)

**1. Backend (Server):**
*   Deploy the `/server` folder to **Railway** or **Render**.
*   Set your `API_KEY` environment variable there.
*   Get your deployed Backend URL (e.g., `https://my-api.onrender.com`).

**2. Frontend (Client):**
*   Deploy the root folder to **Vercel** or **Netlify**.
*   In `vite.config.ts`, you will need to update the proxy target or use Vercel Rewrites to point `/api` calls to your deployed Backend URL.

## Setup and Running Locally

### Prerequisites
*   Node.js (v18+)
*   npm or Yarn

### 1. Backend Setup
Navigate to the `server/` directory:
```bash
cd server
npm install
```

Create a `.env` file in `server/` with your Gemini API Key:
```
API_KEY="YOUR_GEMINI_API_KEY"
```

Start the backend:
```bash
npm run dev
```
*Server runs on port 3001.*

### 2. Frontend Setup
In the project root:
```bash
npm install
npm run dev
```
*Frontend runs on http://localhost:5173.*

## Technologies Used
*   **Frontend:** React, TypeScript, Tailwind CSS, Vite.
*   **Backend:** Node.js, Express, Google GenAI SDK (`@google/genai`).
*   **AI Models:** Gemini 2.5 Flash (News, Quick Post) & Gemini 3 Pro (Complex Pipeline).

---

