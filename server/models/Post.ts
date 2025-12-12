import { Platform } from '../types';

interface ScheduledPostDocument extends mongoose.Document {
    title: string;
    date: string;
    platform: Platform | 'Draft';
    status: 'Scheduled' | 'Published' | 'Draft';
    contentSnippet?: string;
}

const postSchema = new mongoose.Schema<ScheduledPostDocument>({
    title: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    platform: {
        type: String,
        required: true,
        enum: ['LinkedIn', 'Twitter', 'Instagram', 'Facebook', 'Draft'],
    },
    status: {
        type: String,
        required: true,
        enum: ['Scheduled', 'Published', 'Draft'],
        default: 'Scheduled',
    },
    contentSnippet: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
});

const Post = mongoose.model<ScheduledPostDocument>('Post', postSchema);

export default Post;
