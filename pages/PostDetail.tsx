
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { useAuth } from '../services/authContext';
import { Post, Comment } from '../types';
import { ArrowLeft, User, ThumbsUp, ThumbsDown, MessageSquare, Reply, CornerDownRight } from 'lucide-react';

// Recursive Comment Component
const CommentItem: React.FC<{ 
    comment: Comment, 
    postId: string, 
    depth: number,
    onReplySuccess: () => void 
}> = ({ comment, postId, depth, onReplySuccess }) => {
    const { user } = useAuth();
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Optimistic UI for voting could be complex recursively, relying on parent refresh for simplicity
    const [localLikes, setLocalLikes] = useState(comment.likes || []);
    const [localDislikes, setLocalDislikes] = useState(comment.dislikes || []);

    const handleVote = async (type: 'like' | 'dislike') => {
        if(!user) return alert("Please login to vote");
        // Optimistic update
        if(type === 'like') {
            if(localLikes.includes(user.id)) setLocalLikes(prev => prev.filter(id => id !== user.id));
            else {
                setLocalLikes(prev => [...prev, user.id]);
                setLocalDislikes(prev => prev.filter(id => id !== user.id));
            }
        } else {
             if(localDislikes.includes(user.id)) setLocalDislikes(prev => prev.filter(id => id !== user.id));
            else {
                setLocalDislikes(prev => [...prev, user.id]);
                setLocalLikes(prev => prev.filter(id => id !== user.id));
            }
        }
        await db.vote(comment.id, 'comment', type);
    };

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await db.addComment(postId, replyContent, comment.id);
            setIsReplying(false);
            setReplyContent('');
            onReplySuccess();
        } catch (e) {
            alert("Failed to reply");
        } finally {
            setLoading(false);
        }
    };

    const score = localLikes.length - localDislikes.length;
    const isLiked = user && localLikes.includes(user.id);
    const isDisliked = user && localDislikes.includes(user.id);

    return (
        <div className={`mt-4 ${depth > 0 ? 'ml-4 md:ml-8 border-l-2 border-white/5 pl-4' : ''}`}>
            <div className="flex gap-3">
                 <Link to={`/profile/${comment.authorId}`} className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                        {comment.authorAvatar ? <img src={comment.authorAvatar} className="w-full h-full object-cover"/> : <User className="w-4 h-4 text-gray-400"/>}
                    </div>
                </Link>
                <div className="flex-1">
                    <div className="bg-[#1e293b]/40 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between mb-1">
                             <Link to={`/profile/${comment.authorId}`} className="text-sm font-bold text-gray-300 hover:text-white">{comment.authorName}</Link>
                             <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{comment.content}</p>
                    </div>

                    <div className="flex items-center gap-4 mt-2 ml-1 text-xs text-gray-400">
                        <button onClick={() => handleVote('like')} className={`flex items-center gap-1 hover:text-green-400 ${isLiked ? 'text-green-400' : ''}`}>
                            <ThumbsUp className="w-3 h-3" /> {localLikes.length}
                        </button>
                        <button onClick={() => handleVote('dislike')} className={`flex items-center gap-1 hover:text-red-400 ${isDisliked ? 'text-red-400' : ''}`}>
                            <ThumbsDown className="w-3 h-3" /> {localDislikes.length}
                        </button>
                        <button onClick={() => setIsReplying(!isReplying)} className="flex items-center gap-1 hover:text-violet-400">
                            <Reply className="w-3 h-3" /> Reply
                        </button>
                    </div>

                    {isReplying && (
                        <form onSubmit={handleReplySubmit} className="mt-3 flex gap-2 animate-fade-in">
                            <div className="w-6 flex justify-end pt-2"><CornerDownRight className="w-4 h-4 text-gray-600" /></div>
                            <div className="flex-1">
                                <textarea 
                                    value={replyContent}
                                    onChange={e => setReplyContent(e.target.value)}
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded p-2 text-white text-sm focus:outline-none focus:border-violet-500"
                                    placeholder="Write a reply..."
                                    rows={2}
                                />
                                <div className="flex justify-end mt-2 gap-2">
                                    <button type="button" onClick={() => setIsReplying(false)} className="text-xs text-gray-500">Cancel</button>
                                    <button type="submit" disabled={loading} className="text-xs bg-violet-600 px-3 py-1 rounded text-white font-bold">Reply</button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Recursive Replies */}
                    {comment.replies && comment.replies.map(reply => (
                        <CommentItem 
                            key={reply.id} 
                            comment={reply} 
                            postId={postId} 
                            depth={depth + 1} 
                            onReplySuccess={onReplySuccess}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const PostDetail: React.FC = () => {
    const { id } = useParams<{id: string}>();
    const { user } = useAuth();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentContent, setCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        if(!id) return;
        try {
            const data = await db.getPostById(id);
            setPost(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleVotePost = async (type: 'like' | 'dislike') => {
        if(!user || !post) return alert("Login to vote");
        try {
             // Optimistic Update
             const newPost = { ...post };
             const userId = user.id;
             if(!newPost.likes) newPost.likes = [];
             if(!newPost.dislikes) newPost.dislikes = [];

             if(type === 'like') {
                 if(newPost.likes.includes(userId)) newPost.likes = newPost.likes.filter(id => id !== userId);
                 else {
                     newPost.likes.push(userId);
                     newPost.dislikes = newPost.dislikes.filter(id => id !== userId);
                 }
             } else {
                if(newPost.dislikes.includes(userId)) newPost.dislikes = newPost.dislikes.filter(id => id !== userId);
                else {
                    newPost.dislikes.push(userId);
                    newPost.likes = newPost.likes.filter(id => id !== userId);
                }
             }
             setPost(newPost);
             await db.vote(post.id, 'post', type);
             // Background refresh to ensure consistency
             fetchPost();
        } catch(e) { console.error(e); }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!post) return;
        setIsSubmitting(true);
        try {
            await db.addComment(post.id, commentContent);
            setCommentContent('');
            fetchPost();
        } catch(e) {
            alert("Failed to comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    if(loading) return <div className="h-screen bg-[#020617] flex items-center justify-center">Loading...</div>;
    if(!post) return <div className="h-screen bg-[#020617] text-white flex items-center justify-center">Post not found</div>;

    const likeCount = (post.likes?.length || 0) - (post.dislikes?.length || 0);
    const userLiked = user && post.likes?.includes(user.id);
    const userDisliked = user && post.dislikes?.includes(user.id);

    return (
        <div className="pt-28 min-h-screen px-4 md:px-12 pb-20 bg-[#020617]">
             <div className="max-w-4xl mx-auto">
                 <Link to="/community" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
                     <ArrowLeft className="w-4 h-4 mr-2" /> Back to Community
                 </Link>

                 {/* Post Content */}
                 <div className="bg-[#1e293b]/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Link to={`/profile/${post.userId}`} className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden border border-white/10">
                                {post.authorAvatar ? <img src={post.authorAvatar} className="w-full h-full object-cover"/> : <User className="w-6 h-6 text-gray-400"/>}
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{post.title}</h1>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <span>{post.authorName}</span>
                                    <span>•</span>
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    <span className="bg-violet-600/20 text-violet-300 px-2 rounded text-xs">{post.category}</span>
                                </div>
                            </div>
                        </div>
                     </div>

                     <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap mb-8">
                         {post.content}
                     </div>

                     <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                         <button onClick={() => handleVotePost('like')} className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f172a] border border-white/5 hover:border-green-500/50 transition-all ${userLiked ? 'text-green-400 border-green-500/50' : 'text-gray-400'}`}>
                             <ThumbsUp className={`w-5 h-5 ${userLiked ? 'fill-current' : ''}`} />
                             <span>Like</span>
                         </button>
                         <span className={`font-bold text-lg ${likeCount > 0 ? 'text-green-400' : likeCount < 0 ? 'text-red-400' : 'text-gray-500'}`}>{likeCount}</span>
                         <button onClick={() => handleVotePost('dislike')} className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f172a] border border-white/5 hover:border-red-500/50 transition-all ${userDisliked ? 'text-red-400 border-red-500/50' : 'text-gray-400'}`}>
                             <ThumbsDown className={`w-5 h-5 ${userDisliked ? 'fill-current' : ''}`} />
                             <span>Dislike</span>
                         </button>
                     </div>
                 </div>

                 {/* Comments Section */}
                 <div className="mb-12">
                     <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                         <MessageSquare className="w-5 h-5 text-violet-500"/> Discussion
                     </h3>

                     {/* Comment Input */}
                     <div className="mb-8 flex gap-4">
                         <div className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                             {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover"/> : <User className="w-5 h-5 text-gray-500"/>}
                         </div>
                         <div className="flex-1">
                             <form onSubmit={handleComment}>
                                 <textarea 
                                    value={commentContent}
                                    onChange={e => setCommentContent(e.target.value)}
                                    className="w-full bg-[#1e293b]/50 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-violet-500 transition-all min-h-[100px]"
                                    placeholder="Add to the discussion..."
                                    required
                                 />
                                 <div className="flex justify-end mt-2">
                                     <button 
                                        type="submit" 
                                        disabled={isSubmitting || !user}
                                        className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                     >
                                         {user ? 'Post Comment' : 'Login to Comment'}
                                     </button>
                                 </div>
                             </form>
                         </div>
                     </div>

                     {/* Comments List */}
                     <div className="space-y-6">
                         {post.comments && post.comments.length > 0 ? (
                             post.comments.map(comment => (
                                 <CommentItem 
                                    key={comment.id} 
                                    comment={comment} 
                                    postId={post.id} 
                                    depth={0} 
                                    onReplySuccess={fetchPost}
                                />
                             ))
                         ) : (
                             <div className="text-center py-10 text-gray-500">No comments yet. Be the first to share your thoughts!</div>
                         )}
                     </div>
                 </div>
             </div>
        </div>
    );
};

export default PostDetail;
