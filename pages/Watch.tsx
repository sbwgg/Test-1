
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Movie } from '../types';
import { useToast } from '../services/toastContext';
import { useAuth } from '../services/authContext';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, SkipForward, Rewind, MessageSquare, Mic, ShieldCheck, Lock } from 'lucide-react';
import { getFlag } from '../utils/languages';
import Hls from 'hls.js';

const Watch: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  
  // Player State
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSecureStream, setIsSecureStream] = useState(false);
  const [streamLoading, setStreamLoading] = useState(true);
  const [streamError, setStreamError] = useState('');

  // Simulated Media State
  const [currentAudio, setCurrentAudio] = useState('English');
  const [currentSub, setCurrentSub] = useState('Off');

  useEffect(() => {
    const fetchMovieAndStream = async () => {
      if (!id) return;
      setStreamLoading(true);
      
      try {
        const found = await db.getMovieById(id);
        if (!found) {
           navigate('/');
           return;
        }
        setMovie(found);
        if(found.audioLanguages?.length > 0) setCurrentAudio(found.audioLanguages[0]);

        // --- AUTHENTICATE STREAM ---
        // Instead of playing found.videoUrl directly, we request a signed URL from backend
        // This mimics the secure_link behavior
        const token = localStorage.getItem('streamai_token');
        
        try {
            const res = await fetch(`/api/stream/authorize/${id}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            
            if (!res.ok) {
                 if (res.status === 401 || res.status === 403) {
                     setStreamError("Access Denied: Please Login or Upgrade to watch.");
                 } else {
                     setStreamError("Stream authorization failed.");
                 }
                 setStreamLoading(false);
                 return;
            }

            const data = await res.json();
            const secureUrl = data.url;
            setIsSecureStream(true);

            // Initialize Player with Secure URL
            initPlayer(secureUrl);

        } catch (authError) {
            console.error("Stream Auth Failed", authError);
            setStreamError("Failed to connect to secure streaming server.");
        }

      } catch (e) {
        console.error(e);
        navigate('/');
      } finally {
        setStreamLoading(false);
      }
    };

    fetchMovieAndStream();
    
    return () => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
        }
    };
  }, [id, navigate]);

  const initPlayer = (url: string) => {
      const video = videoRef.current;
      if (!video) return;

      const isHls = url.includes('.m3u8');

      if (isHls && Hls.isSupported()) {
          if (hlsRef.current) hlsRef.current.destroy();
          
          const hls = new Hls({
             xhrSetup: (xhr, url) => {
                 // Optional: Add custom headers if using JWT in headers instead of query params
                 // xhr.setRequestHeader('Authorization', `Bearer ${token}`);
             }
          });
          
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
             video.play().catch(() => setIsPlaying(false));
             setIsPlaying(true);
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
             console.error("HLS Error", data);
             if (data.fatal) {
                 toast.error("Stream Error: " + data.type);
             }
          });
          hlsRef.current = hls;

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          video.src = url;
          video.addEventListener('loadedmetadata', () => {
              video.play();
              setIsPlaying(true);
          });
      } else {
          // Standard MP4
          video.src = url;
          video.play().catch(() => setIsPlaying(false));
          setIsPlaying(true);
      }
  };

  // Mouse movement to show/hide controls
  useEffect(() => {
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progressPercent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progressPercent);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * (videoRef.current?.duration || 0);
    if (videoRef.current) {
        videoRef.current.currentTime = newTime;
        setProgress(parseFloat(e.target.value));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
        videoRef.current.volume = newVol;
        setIsMuted(newVol === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        playerContainerRef.current?.requestFullscreen();
        setIsFullscreen(true);
    } else {
        document.exitFullscreen();
        setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const changeAudio = (lang: string) => {
      setCurrentAudio(lang);
      toast.info(`Audio changed to ${lang}`);
  };

  const changeSub = (lang: string) => {
      setCurrentSub(lang);
      toast.info(`Subtitles: ${lang}`);
  };

  if (!movie || streamLoading) return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          <div className="flex items-center gap-2 text-violet-400 font-bold">
              <ShieldCheck className="w-5 h-5 animate-pulse" /> Authenticating Secure Stream...
          </div>
      </div>
  );

  if (streamError) return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
          <div className="bg-red-500/10 p-6 rounded-full border border-red-500/20">
              <Lock className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold">{streamError}</h2>
          <Link to="/login" className="bg-violet-600 px-6 py-2 rounded-lg font-bold hover:bg-violet-700">Login to Watch</Link>
          <Link to="/" className="text-gray-400 hover:text-white underline">Back to Home</Link>
      </div>
  );

  return (
    <div ref={playerContainerRef} className="w-full h-screen bg-black flex flex-col relative overflow-hidden group">
      
      {/* Video Element */}
      <video 
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={movie.coverUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        playsInline
      />

      {/* Secure Indicator (Subtle) */}
      {isSecureStream && (
          <div className="absolute top-6 left-20 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur px-2 py-1 rounded text-[10px] text-green-400 flex items-center gap-1 border border-green-500/20">
              <ShieldCheck className="w-3 h-3" /> Encrypted Connection
          </div>
      )}

      {/* Controls Overlay */}
      <div className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/70 via-transparent to-black/80 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Top Header */}
        <div className="p-6 flex items-center justify-between pointer-events-none">
            <Link to="/" className="text-gray-300 hover:text-white transition-transform hover:scale-110 p-2 bg-black/20 rounded-full pointer-events-auto">
                <ArrowLeft className="h-8 w-8" />
            </Link>
            <div className="text-center md:text-left">
               <h2 className="text-white text-xl md:text-2xl font-bold drop-shadow-md">{movie.title}</h2>
               {movie.type === 'series' && <p className="text-gray-300 text-sm">S1:E1 "Pilot"</p>}
            </div>
            <div className="w-10"></div> {/* Spacer */}
        </div>

        {/* Center Play Button (only when paused) */}
        {!isPlaying && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                <button onClick={togglePlay} className="bg-violet-600/90 text-white p-6 rounded-full hover:bg-violet-600 hover:scale-110 transition-all shadow-[0_0_30px_rgba(124,58,237,0.5)]">
                    <Play className="h-12 w-12 fill-current pl-1" />
                </button>
            </div>
        )}

        {/* Bottom Controls */}
        <div className="px-6 pb-6 pt-20 pointer-events-auto">
            {/* Progress Bar */}
            <div className="relative group/progress mb-4 cursor-pointer">
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={progress} 
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:scale-0 group-hover/progress:[&::-webkit-slider-thumb]:scale-100"
                />
                <div 
                    className="absolute top-0 left-0 h-1.5 bg-violet-500 rounded-lg pointer-events-none" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="flex items-center justify-between">
                
                {/* Left Controls */}
                <div className="flex items-center space-x-6">
                    <button onClick={togglePlay} className="text-white hover:text-violet-400 transition-colors">
                        {isPlaying ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 fill-current" />}
                    </button>
                    
                    <button onClick={() => {
                        if(videoRef.current) videoRef.current.currentTime -= 10;
                    }} className="text-gray-300 hover:text-white transition-colors">
                        <Rewind className="h-6 w-6" />
                    </button>
                    
                    <button onClick={() => {
                        if(videoRef.current) videoRef.current.currentTime += 10;
                    }} className="text-gray-300 hover:text-white transition-colors">
                        <SkipForward className="h-6 w-6" />
                    </button>

                    <div className="flex items-center group/vol">
                        <button onClick={toggleMute} className="text-white hover:text-violet-400 mr-2">
                            {isMuted || volume === 0 ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                        </button>
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300 h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                        />
                    </div>

                    <span className="text-gray-300 text-sm font-medium">
                        {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(videoRef.current?.duration || 0)}
                    </span>
                </div>

                {/* Right Controls */}
                <div className="flex items-center space-x-4 relative">
                    {/* Settings / Audio & Subtitles */}
                    <div className="relative">
                        <button 
                            onClick={() => setSettingsOpen(!settingsOpen)} 
                            className={`text-gray-300 hover:text-white transition-transform duration-300 ${settingsOpen ? 'rotate-90 text-violet-500' : ''}`}
                        >
                            <Settings className="h-6 w-6" />
                        </button>

                        {/* Popover Menu */}
                        {settingsOpen && (
                            <div className="absolute bottom-12 right-0 bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl w-64 animate-slide-up">
                                <div className="space-y-4">
                                    {/* Audio Section */}
                                    <div>
                                        <h4 className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                                            <Mic className="w-3 h-3 mr-1" /> Audio
                                        </h4>
                                        <div className="space-y-1">
                                            {(movie.audioLanguages || ['English']).map(lang => (
                                                <button 
                                                    key={lang} 
                                                    onClick={() => changeAudio(lang)}
                                                    className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors flex items-center justify-between ${currentAudio === lang ? 'bg-violet-600 text-white font-bold' : 'text-gray-300 hover:bg-white/10'}`}
                                                >
                                                    <span>{lang}</span>
                                                    <span>{getFlag(lang)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/10"></div>

                                    {/* Subtitle Section */}
                                    <div>
                                        <h4 className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                                            <MessageSquare className="w-3 h-3 mr-1" /> Subtitles
                                        </h4>
                                        <div className="space-y-1">
                                            <button 
                                                onClick={() => changeSub('Off')}
                                                className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${currentSub === 'Off' ? 'bg-violet-600 text-white font-bold' : 'text-gray-300 hover:bg-white/10'}`}
                                            >
                                                Off
                                            </button>
                                            {(movie.subtitleLanguages || ['English']).map(lang => (
                                                <button 
                                                    key={lang} 
                                                    onClick={() => changeSub(lang)}
                                                    className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors flex items-center justify-between ${currentSub === lang ? 'bg-violet-600 text-white font-bold' : 'text-gray-300 hover:bg-white/10'}`}
                                                >
                                                     <span>{lang}</span>
                                                     <span>{getFlag(lang)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button onClick={toggleFullscreen} className="text-gray-300 hover:text-white transition-transform hover:scale-110">
                        {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
