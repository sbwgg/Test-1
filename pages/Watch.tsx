import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Movie } from '../types';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, SkipForward, Rewind, MessageSquare, Mic } from 'lucide-react';
import { getFlag } from '../utils/languages';

const Watch: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  
  // Player State
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play default
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Simulated Media State
  const [currentAudio, setCurrentAudio] = useState('English');
  const [currentSub, setCurrentSub] = useState('Off');
  const [showToast, setShowToast] = useState('');

  useEffect(() => {
    const fetchMovie = async () => {
      if (id) {
        const found = await db.getMovieById(id);
        if (found) {
          setMovie(found);
          // Set defaults
          if(found.audioLanguages?.length > 0) setCurrentAudio(found.audioLanguages[0]);
        } else {
          navigate('/');
        }
      }
    };
    fetchMovie();
  }, [id, navigate]);

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
      setShowToast(`Audio changed to ${lang}`);
      setTimeout(() => setShowToast(''), 3000);
  };

  const changeSub = (lang: string) => {
      setCurrentSub(lang);
      setShowToast(`Subtitles: ${lang}`);
      setTimeout(() => setShowToast(''), 3000);
  };

  if (!movie) return <div className="h-screen bg-black text-white flex items-center justify-center">Loading Player...</div>;

  return (
    <div ref={playerContainerRef} className="w-full h-screen bg-black flex flex-col relative overflow-hidden group">
      
      {/* Toast Notification */}
      {showToast && (
          <div className="absolute top-20 right-10 bg-black/80 text-white px-6 py-3 rounded-lg border border-white/20 z-50 animate-fade-in backdrop-blur-md">
              {showToast}
          </div>
      )}

      {/* Video Element */}
      <video 
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={movie.coverUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        autoPlay
      >
        <source src={movie.videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Controls Overlay */}
      <div className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/70 via-transparent to-black/80 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Top Header */}
        <div className="p-6 flex items-center justify-between">
            <Link to="/" className="text-gray-300 hover:text-white transition-transform hover:scale-110 p-2 bg-black/20 rounded-full">
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <button onClick={togglePlay} className="bg-violet-600/90 text-white p-6 rounded-full hover:bg-violet-600 hover:scale-110 transition-all shadow-[0_0_30px_rgba(124,58,237,0.5)]">
                    <Play className="h-12 w-12 fill-current pl-1" />
                </button>
            </div>
        )}

        {/* Bottom Controls */}
        <div className="px-6 pb-6 pt-20">
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
