import React, { useState, useEffect } from 'react';
import { ScheduledPost, Platform } from '../types';

interface DetailedPost extends ScheduledPost {
    status: 'Scheduled' | 'Published' | 'Draft'; // Make status non-optional in DetailedPost context
}

// Reusable Platform Icons
const PlatformIcon = ({ platform, className = "w-6 h-6" }: { platform: Platform | 'Default', className?: string }) => {
    switch (platform) {
        case 'LinkedIn': return <svg className={`${className} text-blue-700`} fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>;
        case 'Twitter': return <svg className={`${className} text-sky-500`} fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>;
        case 'Facebook': return <svg className={`${className} text-blue-600`} fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
        case 'Instagram': return <svg className={`${className} text-pink-600`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>;
        case 'Draft': return <svg className={`${className} text-gray-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
        case 'Default':
        default: return <svg className={`${className} text-indigo-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>;
    }
};


export const CalendarFeature: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [posts, setPosts] = useState<DetailedPost[]>([]);
    const [draggedPostId, setDraggedPostId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // New State for Interactions
    const [selectedPost, setSelectedPost] = useState<DetailedPost | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditingModal, setIsEditingModal] = useState(false);
    const [modalEditedPost, setModalEditedPost] = useState<DetailedPost | null>(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/posts');
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setPosts(data);
        } catch (e) {
            console.error("Failed to load posts", e);
            showNotification("Failed to load posts", "error");
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedPostId(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e: React.DragEvent, day: number) => {
        e.preventDefault();
        if (!draggedPostId) return;

        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 10, 0);
        const isoDate = newDate.toISOString();

        // Optimistic update
        const updatedPosts = posts.map(p =>
            p.id === draggedPostId ? { ...p, date: isoDate } : p
        );
        setPosts(updatedPosts);

        setLoading(true);
        try {
            // We use the generic update endpoint now
            const response = await fetch(`/api/posts/${draggedPostId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: isoDate })
            });

            if (!response.ok) throw new Error("Failed to sync reschedule");
            showNotification("Post rescheduled successfully", "success");
        } catch (err) {
            console.error(err);
            showNotification("Sync failed. Refreshing...", "error");
            fetchPosts(); // Revert on failure
        } finally {
            setLoading(false);
            setDraggedPostId(null);
        }
    };

    const handlePostClick = (post: DetailedPost, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedPost(post);
        setModalEditedPost(JSON.parse(JSON.stringify(post))); // Deep copy for editing
        setIsEditingModal(false); // Start in view mode
        setIsModalOpen(true);
    };

    const handleQuickAdd = (day: number) => {
        const newPost: DetailedPost = {
            id: Date.now().toString(),
            title: "New Draft Post",
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 9, 0).toISOString(),
            platform: "Draft",
            status: "Draft",
            contentSnippet: ""
        };
        // Temporarily add to posts for immediate display, will be saved on modal save
        setPosts(prev => [...prev, newPost]);
        setSelectedPost(newPost);
        setModalEditedPost(JSON.parse(JSON.stringify(newPost)));
        setIsEditingModal(true); // Open in edit mode directly
        setIsModalOpen(true);
    };

    const handleModalSave = async () => {
        if (!modalEditedPost) return;

        // Validate if title is empty
        if (!modalEditedPost.title.trim()) {
            showNotification("Post title cannot be empty.", "error");
            return;
        }

        setLoading(true);
        try {
            // Check if it's a new post (we used Date.now() string as temp ID for drafts)
            // A better check might be if it exists in the backend, but simpler is:
            const isNew = selectedPost?.title === "New Draft Post" || !posts.find(p => p.id === modalEditedPost.id); // Or logic based on ID format if we stick to mongo IDs

            let response;
            if (isNew) {
                response = await fetch('/api/schedule', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        scheduleTime: modalEditedPost.date,
                        title: modalEditedPost.title,
                        platform: modalEditedPost.platform,
                        status: modalEditedPost.status,
                        contentSnippet: modalEditedPost.contentSnippet
                    })
                });
            } else {
                response = await fetch(`/api/posts/${modalEditedPost.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(modalEditedPost)
                });
            }

            if (!response.ok) throw new Error("Failed to save");

            const savedPost = await response.json();

            if (isNew) {
                // Replace the temp post with the real one from DB (with real _id)
                setPosts(prev => [...prev.filter(p => p.id !== modalEditedPost.id), { ...savedPost, id: savedPost.id || savedPost._id }]); // Handle ID
                // Actually better to just refetch
                fetchPosts();
            } else {
                setPosts(prev => prev.map(p => p.id === modalEditedPost.id ? modalEditedPost : p));
            }

            setIsModalOpen(false);
            showNotification("Post saved successfully", "success");

        } catch (e) {
            console.error(e);
            showNotification("Failed to save changes", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleModalCancel = () => {
        // If it was a quick add draft, remove it from the posts state
        if (selectedPost && selectedPost.status === 'Draft' && !selectedPost.title.startsWith("New Draft Post") && !modalEditedPost?.title.trim()) {
            setPosts(prev => prev.filter(p => p.id !== selectedPost.id));
        }
        setIsModalOpen(false);
    };

    const handleDeletePost = async () => {
        if (!selectedPost) return;

        if (confirm("Are you sure you want to delete this post?")) {
            try {
                const res = await fetch(`/api/posts/${selectedPost.id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error("Delete failed");

                setPosts(prev => prev.filter(p => p.id !== selectedPost.id));
                setIsModalOpen(false);
                showNotification("Post deleted", "success");
            } catch (e) {
                showNotification("Failed to delete post", "error");
            }
        }
    };

    const showNotification = (msg: string, type: 'success' | 'error') => {
        setNotification({ message: msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const getPlatformStyle = (platform: Platform) => {
        switch (platform.toLowerCase()) {
            case 'linkedin': return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
            case 'instagram': return 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200';
            case 'twitter': return 'bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200';
            case 'facebook': return 'bg-blue-200 text-blue-900 border-blue-300 hover:bg-blue-300';
            case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200 border-dashed hover:bg-gray-200';
            default: return 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200';
        }
    };

    const renderCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50/30 border-r border-b border-gray-100"></div>);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayPosts = posts.filter(p => {
                const pDate = new Date(p.date);
                return pDate.getDate() === day && pDate.getMonth() === month && pDate.getFullYear() === year;
            }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort posts by time

            const today = new Date();
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

            days.push(
                <div
                    key={day}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day)}
                    className={`h-32 border-r border-b border-gray-100 p-2 overflow-y-auto transition-all duration-200 relative group
                    ${isToday ? 'bg-blue-50/30' : 'bg-white'}
                    hover:bg-gray-50
                `}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700'
                            }`}>
                            {day}
                        </span>

                        {/* Quick Add Button (Visible on Hover) */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleQuickAdd(day); }}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity p-1"
                            title="Add Post"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                    </div>

                    <div className="space-y-1">
                        {dayPosts.map(post => (
                            <div
                                key={post.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, post.id)}
                                onClick={(e) => handlePostClick(post, e)}
                                className={`text-xs p-1.5 rounded cursor-pointer shadow-sm border truncate flex items-center gap-1.5 transition-colors ${getPlatformStyle(post.platform)}`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${post.status === 'Published' ? 'bg-green-500' :
                                        post.status === 'Scheduled' ? 'bg-indigo-500' : 'bg-gray-400'
                                    }`}></span>
                                <span className="font-semibold truncate">{post.title}</span>
                                {/* Display time for scheduled posts */}
                                {post.status === 'Scheduled' && (
                                    <span className="text-gray-600 font-normal ml-auto text-[0.6rem]">
                                        {new Date(post.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="w-full max-w-6xl mx-auto h-full flex flex-col relative">
            {/* Event Details Modal */}
            {isModalOpen && selectedPost && modalEditedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">{isEditingModal ? 'Edit Post' : 'Post Details'}</h3>
                            <button onClick={handleModalCancel} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label htmlFor="post-title" className="text-xs font-bold text-gray-500 uppercase tracking-wide">Title</label>
                                {isEditingModal ? (
                                    <input
                                        id="post-title"
                                        type="text"
                                        value={modalEditedPost.title}
                                        onChange={(e) => setModalEditedPost({ ...modalEditedPost, title: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                ) : (
                                    <p className="text-lg font-medium text-gray-900 mt-1">{selectedPost.title}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="post-platform" className="text-xs font-bold text-gray-500 uppercase tracking-wide">Platform</label>
                                    {isEditingModal ? (
                                        <select
                                            id="post-platform"
                                            value={modalEditedPost.platform}
                                            onChange={(e) => setModalEditedPost({ ...modalEditedPost, platform: e.target.value as Platform })}
                                            className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        >
                                            {['LinkedIn', 'Twitter', 'Instagram', 'Facebook', 'Draft'].map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getPlatformStyle(selectedPost.platform)}`}>
                                            <PlatformIcon platform={selectedPost.platform} className="w-4 h-4 mr-1" />
                                            {selectedPost.platform}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="post-date" className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date & Time</label>
                                    {isEditingModal ? (
                                        <input
                                            id="post-date"
                                            type="datetime-local"
                                            value={modalEditedPost.date.substring(0, 16)} // Format for datetime-local
                                            onChange={(e) => setModalEditedPost({ ...modalEditedPost, date: e.target.value + ":00.000Z" })} // Re-add seconds and timezone
                                            className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-900 mt-1">
                                            {new Date(selectedPost.date).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="post-status" className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status</label>
                                {isEditingModal ? (
                                    <select
                                        id="post-status"
                                        value={modalEditedPost.status}
                                        onChange={(e) => setModalEditedPost({ ...modalEditedPost, status: e.target.value as 'Scheduled' | 'Published' | 'Draft' })}
                                        className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Published">Published</option>
                                    </select>
                                ) : (
                                    <p className="text-sm text-gray-700 flex items-center gap-2 mt-1">
                                        <span className={`w-2 h-2 rounded-full ${selectedPost.status === 'Published' ? 'bg-green-500' :
                                                selectedPost.status === 'Scheduled' ? 'bg-indigo-500' : 'bg-gray-400'
                                            }`}></span>
                                        {selectedPost.status}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="post-snippet" className="text-xs font-bold text-gray-500 uppercase tracking-wide">Content Snippet</label>
                                {isEditingModal ? (
                                    <textarea
                                        id="post-snippet"
                                        value={modalEditedPost.contentSnippet}
                                        onChange={(e) => setModalEditedPost({ ...modalEditedPost, contentSnippet: e.target.value })}
                                        rows={4}
                                        className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:ring-blue-500 focus:border-blue-500 resize-y"
                                        placeholder="Add a short description of the post content..."
                                    />
                                ) : (
                                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                                        {selectedPost.contentSnippet || "No snippet available."}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                            <button
                                onClick={handleDeletePost}
                                className="text-red-600 hover:text-red-800 text-sm font-bold flex items-center px-3 py-2 rounded-md hover:bg-red-50"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                Delete Post
                            </button>
                            {isEditingModal ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setModalEditedPost(JSON.parse(JSON.stringify(selectedPost))); // Revert changes
                                            setIsEditingModal(false);
                                        }}
                                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleModalSave}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditingModal(true)}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-md"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleModalCancel}
                                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-300"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Content Calendar</h2>
                    <p className="text-gray-500">Plan, schedule, and manage your posting timeline.</p>
                </div>

                <div className="flex items-center space-x-4 bg-white p-2 rounded-xl shadow-sm border border-gray-200 self-end md:self-auto">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <span className="text-lg font-bold text-gray-800 w-40 text-center select-none">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>
            </div>

            {notification && (
                <div className={`fixed top-20 md:top-6 right-6 p-4 rounded-xl shadow-xl z-[60] text-white font-medium animate-fade-in-down flex items-center
            ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}
          `}>
                    <span className="mr-2 text-xl">{notification.type === 'success' ? '✓' : '⚠'}</span>
                    {notification.message}
                </div>
            )}

            {loading && (
                <div className="fixed inset-0 bg-black/10 z-40 flex items-center justify-center pointer-events-none">
                    <div className="bg-white p-4 rounded-full shadow-xl">
                        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex-1 flex flex-col overflow-x-auto ring-1 ring-black/5">
                <div className="min-w-[800px]">
                    {/* Days of week header */}
                    <div className="grid grid-cols-7 bg-gray-50/80 border-b border-gray-200 backdrop-blur-sm">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 bg-gray-50 flex-1 auto-rows-fr">
                        {renderCalendarDays()}
                    </div>
                </div>
            </div>
        </div>
    );
};