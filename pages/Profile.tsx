
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { useAuth } from '../services/authContext';
import { Movie, Post, UserRole } from '../types';
import MovieCard from '../components/MovieCard';
import { User, Calendar, ShieldCheck, Film, MessageSquare, Lock, Eye, EyeOff } from 'lucide-react';

interface ProfileData {
    id: string;
    name: string;
    role: string;
    avatarUrl: string;
    createdAt: string;
    isWatchlistPublic: boolean;
    watchlist: string[]; // IDs
    stats: {
        postsCount: number;
        commentsCount: number;
    };
    activity: Post[];
}

const Profile: React.FC = () => {
    const { id } = useParams<{id: string}>();
    const { user, refreshUser, updateProfile } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'watchlist' | 'activity'>('watchlist');

    useEffect(() => {
        fetchProfile();
    }, [id, user]); // Re-fetch if auth state changes (to see private list)

    const fetchProfile = async () => {
        if(!id) return;
        try {
            const data = await db.getPublicProfile(id);
            setProfile(data);
            
            if(data.watchlist && data.watchlist.length > 0) {
                const allMovies = await db.getMovies();
                const userMovies = allMovies.filter(m => data.watchlist.includes(m.id));
                setWatchlistMovies(userMovies);
            } else {
                setWatchlistMovies([]);
            }

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const togglePrivacy = async () => {
        if(!profile) return;
        const newState = !profile.isWatchlistPublic;
        // Optimistic
        setProfile({...profile, isWatchlistPublic: newState});
        
        try {
            await updateProfile({ isWatchlistPublic: newState });
            await refreshUser(); // Update context
        } catch(e) {
            alert("Failed to update privacy");
        }
    };

    if(loading) return <div className="h-screen bg-[#020617] flex items-center justify-center">Loading Profile...</div>;
    if(!profile) return <div className="h-screen bg-[#020617] flex items-center justify-center text-white">User not found</div>;

    const isOwnProfile = user?.id === profile.id;

    return (
        <div className="pt-24 min-h-screen px-4 md:px-12 pb-20 bg-[#020617]">
            <div className="max-w-6xl mx-auto">
                {/* Header Card */}
                <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#0f172a] shadow-2xl overflow-hidden bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                         {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover"/> : <span className="text-4xl font-bold text-white">{profile.name.charAt(0)}</span>}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                             <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                             {profile.role === 'ADMIN' && (
                                 <span className="bg-violet-600/20 text-violet-300 px-3 py-1 rounded-full text-xs font-bold border border-violet-500/30 flex items-center gap-1">
                                     <ShieldCheck className="w-3 h-3"/> ADMIN
                                 </span>
                             )}
                        </div>
                        <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2 mb-6">
                            <Calendar className="w-4 h-4" /> Member since {new Date(profile.createdAt).toLocaleDateString()}
                        </p>

                        <div className="flex items-center justify-center md:justify-start gap-8 text-sm">
                            <div className="text-center md:text-left">
                                <span className="block text-xl font-bold text-white">{profile.stats.postsCount}</span>
                                <span className="text-gray-500 uppercase text-xs font-bold tracking-wider">Posts</span>
                            </div>
                            <div className="text-center md:text-left">
                                <span className="block text-xl font-bold text-white">{profile.watchlist.length}</span>
                                <span className="text-gray-500 uppercase text-xs font-bold tracking-wider">Watchlist</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800 mb-8">
                    <button 
                        onClick={() => setActiveTab('watchlist')}
                        className={`px-8 py-4 font-bold text-sm transition-colors relative flex items-center gap-2 ${activeTab === 'watchlist' ? 'text-violet-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Film className="w-4 h-4" /> Watchlist
                        {activeTab === 'watchlist' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('activity')}
                        className={`px-8 py-4 font-bold text-sm transition-colors relative flex items-center gap-2 ${activeTab === 'activity' ? 'text-violet-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <MessageSquare className="w-4 h-4" /> Activity
                        {activeTab === 'activity' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500"></div>}
                    </button>
                </div>

                {/* Content */}
                <div className="animate-fade-in">
                    {activeTab === 'watchlist' && (
                        <div>
                             <div className="flex justify-between items-center mb-6">
                                 <h2 className="text-xl font-bold text-white">Watchlist</h2>
                                 {isOwnProfile && (
                                     <button onClick={togglePrivacy} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                                         {profile.isWatchlistPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                         {profile.isWatchlistPublic ? 'Public' : 'Private'}
                                     </button>
                                 )}
                             </div>
                             
                             {!profile.isWatchlistPublic && !isOwnProfile ? (
                                 <div className="bg-[#1e293b]/30 p-12 rounded-2xl text-center border border-white/5">
                                     <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                     <h3 className="text-lg font-bold text-gray-400">This watchlist is private.</h3>
                                 </div>
                             ) : watchlistMovies.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    {watchlistMovies.map(movie => (
                                        <div key={movie.id} className="transform hover:-translate-y-2 transition-transform">
                                            <MovieCard movie={movie} />
                                        </div>
                                    ))}
                                </div>
                             ) : (
                                <div className="text-gray-500 italic">No movies in watchlist yet.</div>
                             )}
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-white mb-6">Recent Posts</h2>
                            {profile.activity.length > 0 ? (
                                profile.activity.map(post => (
                                    <Link key={post.id} to={`/community/post/${post.id}`} className="block bg-[#1e293b]/40 hover:bg-[#1e293b]/60 border border-white/5 p-6 rounded-xl transition-all">
                                        <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
                                        <p className="text-gray-400 text-sm line-clamp-2 mb-3">{post.content}</p>
                                        <div className="flex gap-4 text-xs text-gray-500">
                                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                            <span className="text-violet-400">{post.category}</span>
                                            <span>{post.likes?.length || 0} Likes</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-gray-500 italic">No activity to show.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
