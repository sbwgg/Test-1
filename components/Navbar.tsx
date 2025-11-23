
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { useSettings } from '../services/settingsContext';
import { Search, Bell, LogOut, ShieldCheck, Menu, X, ChevronDown, User as UserIcon, Sparkles, Settings, Users, Film, AlertTriangle } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Series', path: '/search?type=series' },
    { name: 'Movies', path: '/search?type=movie' },
    { name: 'Community', path: '/community' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col font-sans">
      
      {/* Global Notification Banner - Now part of the fixed header stack */}
      {settings.showNotification && (
          <div className="bg-yellow-600/95 backdrop-blur-md border-b border-yellow-500/30 text-white px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-3 relative z-[60] animate-fade-in shadow-lg">
             <AlertTriangle className="w-4 h-4 text-yellow-200 fill-yellow-500/20" />
             <span>{settings.notificationMessage}</span>
          </div>
      )}

      <nav 
        className={`w-full transition-all duration-700 ease-in-out relative z-50 ${
          isScrolled 
            ? 'bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]' 
            : 'bg-gradient-to-b from-[#020617] via-[#020617]/80 to-transparent py-5'
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between">
            
            {/* Logo & Desktop Menu */}
            <div className="flex items-center gap-8 lg:gap-12">
              <Link to="/" className="flex items-center gap-2 group cursor-pointer">
                <Sparkles className="h-6 w-6 text-violet-500 group-hover:rotate-12 transition-transform" />
                <span className="text-2xl lg:text-3xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                  YUME<span className="text-violet-400 font-light">TV</span>
                </span>
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name}
                    to={link.path} 
                    className={`text-sm font-medium transition-all duration-300 hover:text-violet-300 ${
                      location.pathname === link.path ? 'text-white font-bold drop-shadow-glow' : 'text-gray-400'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Icons */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/search" className="text-gray-300 hover:text-white transition-transform hover:scale-110">
                <Search className="h-5 w-5" />
              </Link>
              <button className="text-gray-300 hover:text-white transition-transform hover:scale-110 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-violet-500 rounded-full animate-pulse"></span>
              </button>
              
              {user ? (
                <div className="relative group z-50">
                  <div className="flex items-center gap-2 cursor-pointer py-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-xs font-bold ring-2 ring-transparent group-hover:ring-white/20 transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 text-white group-hover:rotate-180 transition-transform duration-500 ease-out" />
                  </div>
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 invisible group-hover:visible overflow-hidden origin-top-right">
                    <div className="p-1">
                      <div className="px-4 py-3 border-b border-gray-700/50 mb-1 bg-white/5">
                        <p className="text-sm text-white font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link to={`/profile/${user.id}`} className="flex items-center px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white rounded-md transition-colors">
                        <Film className="h-4 w-4 mr-3" /> My Profile
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link to="/admin" className="flex items-center px-4 py-2.5 text-sm text-gray-200 hover:bg-violet-600/20 hover:text-violet-200 rounded-md transition-colors">
                          <ShieldCheck className="h-4 w-4 mr-3 text-violet-400" /> Admin Dashboard
                        </Link>
                      )}
                      <Link to="/settings" className="flex items-center px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white rounded-md transition-colors">
                        <Settings className="h-4 w-4 mr-3" /> Account Settings
                      </Link>
                      <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white rounded-md transition-colors">
                        <LogOut className="h-4 w-4 mr-3" /> Sign out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-4">
               <Link to="/search" className="text-white"><Search className="h-6 w-6" /></Link>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white hover:text-gray-300 transition p-1">
                {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden absolute w-full bg-[#0f172a]/95 backdrop-blur-xl border-b border-gray-800 transition-all duration-500 ease-in-out overflow-hidden shadow-2xl ${mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
               <Link key={link.name} to={link.path} className="block px-3 py-4 text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md border-b border-white/5">
                 {link.name}
               </Link>
            ))}
            <div className="pt-4 pb-2">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center px-3 mb-4 space-x-3">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-lg overflow-hidden">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                     </div>
                     <div>
                       <p className="text-white font-medium">{user.name}</p>
                       <p className="text-gray-500 text-xs">{user.email}</p>
                     </div>
                  </div>
                  <Link to={`/profile/${user.id}`} className="block px-3 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">
                     <Film className="inline-block w-4 h-4 mr-2" /> My Profile
                  </Link>
                  {user.role === 'ADMIN' && (
                     <Link to="/admin" className="block px-3 py-3 text-base font-medium text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 rounded-md">
                       <ShieldCheck className="inline-block w-4 h-4 mr-2" />
                       Admin Dashboard
                     </Link>
                  )}
                  <Link to="/settings" className="block px-3 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">
                    <Settings className="inline-block w-4 h-4 mr-2" /> Settings
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-3 text-base font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-md">Sign Out</button>
                </div>
              ) : (
                <Link to="/login" className="block w-full px-3 py-4 text-base font-bold text-white bg-violet-600 rounded-md text-center mt-2 shadow-lg">Sign In</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
