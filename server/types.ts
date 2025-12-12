export interface InstagramContent {
    caption: string;
    hashtags: string[];
}

export type Platform = 'LinkedIn' | 'Twitter' | 'Instagram' | 'Facebook' | 'Draft';

export interface PipelineResults {
    outline: string;
    linkedin: string;
    instagram: InstagramContent;
    blog: string;
    seo_keywords: string[];
    image_prompt: string;
    scheduled?: boolean; // Optional: indicates if the post was scheduled
    schedulingMessage?: string; // Optional: detailed feedback from scheduling tool
    imageUrl?: string; // Optional: for generated image URL
}

export interface LoadingStep {
    label: string;
    completed: boolean;
}

export type Tone = 'Professional' | 'Casual' | 'Witty' | 'Enthusiastic' | 'Formal' | 'Empathetic';
export type Audience = 'General Public' | 'Industry Experts' | 'Students' | 'Small Business Owners' | 'Tech Enthusiasts';

export interface NewsArticle {
    title: string;
    uri: string;
    snippet: string;
}

export interface ScheduledPost {
    id: string;
    title: string;
    date: string;
    platform: Platform;
    status?: 'Scheduled' | 'Published' | 'Draft';
    contentSnippet?: string; // A short description or snippet of the post content
}
