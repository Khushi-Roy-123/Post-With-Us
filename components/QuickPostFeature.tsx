import React, { useState, useRef, useCallback } from 'react';

type PlatformKey = 'Twitter' | 'LinkedIn' | 'Facebook' | 'Instagram';

interface MediaFile {
    file: File;
    preview: string;
    type: 'image' | 'video' | 'document';
    content?: string; // For text-based documents
}

const PlatformIcons: Record<PlatformKey, React.ReactNode> = {
    Twitter: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
    ),
    LinkedIn: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
        </svg>
    ),
    Facebook: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
    ),
    Instagram: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.49c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
        </svg>
    ),
};

export const QuickPostFeature: React.FC = () => {
    const [input, setInput] = useState('');
    const [platform, setPlatform] = useState<PlatformKey>('Twitter');
    const [generatedPost, setGeneratedPost] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    const processFiles = useCallback(async (selectedFiles: FileList | File[]) => {
        const newFiles: MediaFile[] = [];

        for (const file of Array.from(selectedFiles)) {
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                const fileUrl = URL.createObjectURL(file);
                newFiles.push({
                    file,
                    preview: fileUrl,
                    type: file.type.startsWith('video/') ? 'video' : 'image'
                });
            } else if (file.name.match(/\.(txt|md|csv|json)$/i)) {
                // Text based documents
                const text = await file.text();
                newFiles.push({
                    file,
                    preview: '', // No preview for docs
                    type: 'document',
                    content: text
                });
            }
        }
        setFiles(prev => [...prev, ...newFiles]);
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(e.target.files);
        }
        // Reset input so same file can be selected again
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (docInputRef.current) docInputRef.current.value = '';
    };

    const removeFile = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            if (newFiles[index].preview) {
                URL.revokeObjectURL(newFiles[index].preview);
            }
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const generateContent = async (targetPlatform: PlatformKey) => {
        if (!input.trim() && files.length === 0) return;

        setIsLoading(true);
        setCopied(false);

        try {
            // Process files
            const mediaPayload = await Promise.all(
                files.filter(f => f.type !== 'document').map(async (mf) => ({
                    data: await fileToBase64(mf.file),
                    mimeType: mf.file.type
                }))
            );

            const docPayload = files
                .filter(f => f.type === 'document')
                .map(f => ({
                    name: f.file.name,
                    content: f.content
                }));

            const response = await fetch('/api/quick-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: input,
                    platform: targetPlatform,
                    media: mediaPayload,
                    documents: docPayload
                }),
            });
            const data = await response.json();
            setGeneratedPost(data.post);
        } catch (err) {
            console.error(err);
            setGeneratedPost('Error generating post. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        await generateContent(platform);
    };

    const handleRepurpose = async (target: PlatformKey) => {
        setPlatform(target);
        await generateContent(target);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedPost);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const platformColors: Record<PlatformKey, string> = {
        Twitter: 'hover:border-sky-400 hover:bg-sky-50 text-sky-500',
        LinkedIn: 'hover:border-blue-700 hover:bg-blue-50 text-blue-700',
        Facebook: 'hover:border-blue-600 hover:bg-blue-50 text-blue-600',
        Instagram: 'hover:border-pink-500 hover:bg-pink-50 text-pink-600',
    };

    const activePlatformColors: Record<PlatformKey, string> = {
        Twitter: 'border-sky-500 bg-sky-100 text-sky-700',
        LinkedIn: 'border-blue-700 bg-blue-100 text-blue-900',
        Facebook: 'border-blue-600 bg-blue-100 text-blue-900',
        Instagram: 'border-pink-500 bg-pink-100 text-pink-900',
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-0">
            <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Quick Social Post</h2>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">Transform any URL, headline, video, or image into a perfectly formatted social media update in seconds.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Input Section */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl">
                    <form onSubmit={handleGenerate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Choose Platform</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {(Object.keys(PlatformIcons) as PlatformKey[]).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPlatform(p)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${platform === p
                                            ? activePlatformColors[p]
                                            : `border-gray-100 bg-white text-gray-500 ${platformColors[p]}`
                                            }`}
                                    >
                                        <span className="mb-1">{PlatformIcons[p]}</span>
                                        <span className="text-xs font-semibold">{p}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Source Content</label>
                                <span className={`text-xs font-medium ${input.length > 280 ? 'text-orange-500' : 'text-gray-400'}`}>{input.length} chars</span>
                            </div>

                            {/* Drag and Drop Area */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`relative w-full rounded-xl transition-all duration-200 ${isDragging ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                            >
                                <textarea
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-gray-700 placeholder-gray-300 bg-gray-50 focus:bg-white min-h-[140px]"
                                    rows={6}
                                    placeholder="Paste text here, or drag & drop images/videos..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />

                                {/* Action Buttons */}
                                <div className="absolute bottom-3 right-3 flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 text-gray-500 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-lg shadow-sm border border-gray-200 transition-colors flex items-center space-x-1"
                                        title="Attach Photo/Video"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => docInputRef.current?.click()}
                                        className="p-2 text-gray-500 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-lg shadow-sm border border-gray-200 transition-colors flex items-center space-x-1"
                                        title="Attach Document"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </button>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileInputChange}
                                        accept="image/*,video/*"
                                        multiple
                                    />
                                    <input
                                        type="file"
                                        ref={docInputRef}
                                        className="hidden"
                                        onChange={handleFileInputChange}
                                        accept=".txt,.md,.csv,.json"
                                        multiple
                                    />
                                </div>
                            </div>

                            {/* File Previews */}
                            {files.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-3">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-square">
                                            {file.type === 'video' ? (
                                                <video src={file.preview} className="w-full h-full object-cover" />
                                            ) : file.type === 'document' ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-2 text-center">
                                                    <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                    <span className="text-xs text-gray-600 font-medium break-all line-clamp-2">{file.file.name}</span>
                                                </div>
                                            ) : (
                                                <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(idx)}
                                                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                </button>
                                            </div>
                                            {file.type === 'video' && (
                                                <div className="absolute bottom-1 right-1 pointer-events-none">
                                                    <svg className="w-4 h-4 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || (!input && files.length === 0)}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center
                        ${isLoading || (!input && files.length === 0)
                                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:-translate-y-1'
                                }
                    `}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing & Crafting...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    Generate Magic
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Output Section */}
                <div className="bg-white p-1 rounded-2xl shadow-xl border border-gray-100 h-full flex flex-col relative overflow-hidden">
                    {/* Decorative header background */}
                    <div className={`h-24 w-full absolute top-0 left-0 bg-gradient-to-r opacity-10 
                ${platform === 'Twitter' ? 'from-sky-400 to-blue-500' : ''}
                ${platform === 'LinkedIn' ? 'from-blue-600 to-indigo-700' : ''}
                ${platform === 'Facebook' ? 'from-blue-500 to-blue-700' : ''}
                ${platform === 'Instagram' ? 'from-pink-500 via-red-500 to-yellow-500' : ''}
            `}></div>

                    <div className="relative z-10 p-6 sm:p-8 flex flex-col h-full">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-white shadow-md
                        ${platform === 'Twitter' ? 'bg-sky-500' : ''}
                        ${platform === 'LinkedIn' ? 'bg-blue-700' : ''}
                        ${platform === 'Facebook' ? 'bg-blue-600' : ''}
                        ${platform === 'Instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : ''}
                    `}>
                                {PlatformIcons[platform]}
                            </span>
                            Your {platform} Post
                        </h3>

                        <div className={`flex-1 rounded-xl p-6 border-2 border-dashed flex items-center justify-center relative transition-colors duration-300
                    ${generatedPost ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'}
                `}>
                            {isLoading ? (
                                <div className="text-center">
                                    <div className="animate-spin w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                                    <p className="text-gray-400 font-medium animate-pulse">AI is watching & thinking...</p>
                                </div>
                            ) : generatedPost ? (
                                <div className="w-full h-full flex flex-col">
                                    <div className="prose prose-sm max-w-none flex-1 overflow-y-auto mb-4 custom-scrollbar">
                                        <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap font-medium">{generatedPost}</p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
                                        <div className="flex justify-end items-center space-x-3">
                                            <span className="text-xs text-gray-400 font-medium">{generatedPost.length} chars</span>
                                            <button
                                                onClick={handleCopy}
                                                className={`text-sm font-bold flex items-center transition-all px-4 py-2 rounded-lg shadow-sm
                                            ${copied
                                                        ? 'text-green-700 bg-green-50 border border-green-200'
                                                        : 'text-gray-600 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:shadow'
                                                    }`}
                                            >
                                                {copied ? (
                                                    <>
                                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                                        Copy Text
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Regenerate & Repurpose Controls */}
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <div className="flex justify-between items-center mb-3">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Refine Results</p>
                                                <button
                                                    onClick={() => generateContent(platform)}
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                                    disabled={isLoading}
                                                >
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12c0 1.577.538 3.037 1.442 4.26M19 19v-5h-.581m-15.356-2A8.001 8.001 0 0120 12c0-1.577-.538-3.037-1.442-4.26"></path></svg>
                                                    Regenerate
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {(Object.keys(PlatformIcons) as PlatformKey[]).filter(p => p !== platform).map((p) => (
                                                    <button
                                                        key={p}
                                                        onClick={() => handleRepurpose(p)}
                                                        disabled={isLoading}
                                                        className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                                                    >
                                                        <span className="mr-1.5 w-4 h-4">{PlatformIcons[p]}</span>
                                                        Convert to {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center max-w-xs mx-auto">
                                    <div className="text-gray-300 mb-2">
                                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    </div>
                                    <p className="text-gray-400 font-medium">Your generated post will appear here ready to be shared.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};