import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { Search, Bell, LogOut, ShieldCheck, Menu, X, ChevronDown, User } from 'lucide-react';
import { UserRole } from '../types';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
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
    { name: 'Series', path: '/' },
    { name: 'Movies', path: '/' },
    { name: 'New & Popular', path: '/' },
  ];

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-700 ease-in-out ${
        isScrolled 
          ? 'bg-[#141414]/95 backdrop-blur-md border-b border-white/5 py-3 shadow-2xl' 
          : 'bg-gradient-to-b from-black/90 via-black/60 to-transparent py-5'
      }`}
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between">
          
          {/* Logo & Desktop Menu */}
          <div className="flex items-center gap-8 lg:gap-12">
            <Link to="/" className="text-red-600 text-2xl lg:text-3xl font-black tracking-tighter cursor-pointer hover:scale-105 transition-transform duration-300 drop-shadow-md">
              YUME<span className="text-white font-light">TV</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  to={link.path} 
                  className={`text-sm font-medium transition-all duration-300 hover:text-gray-300 ${
                    location.pathname === link.path ? 'text-white font-bold' : 'text-gray-400'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-white hover:text-gray-300 transition-transform hover:scale-110">
              <Search className="h-5 w-5" />
            </button>
            <button className="text-white hover:text-gray-300 transition-transform hover:scale-110">
              <Bell className="h-5 w-5" />
            </button>
            
            {user ? (
              <div className="relative group z-50">
                <div className="flex items-center gap-2 cursor-pointer py-1">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold ring-2 ring-transparent group-hover:ring-white/20 transition-all">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="h-4 w-4 text-white group-hover:rotate-180 transition-transform duration-500 ease-out" />
                </div>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#181818] border border-gray-800 rounded-lg shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 invisible group-hover:visible overflow-hidden origin-top-right">
                  <div className="p-1">
                    <div className="px-4 py-3 border-b border-gray-700/50 mb-1 bg-white/5">
                      <p className="text-sm text-white font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    {user.role === UserRole.ADMIN && (
                      <Link to="/admin" className="flex items-center px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white rounded-md transition-colors">
                        <ShieldCheck className="h-4 w-4 mr-3 text-red-500" /> Admin Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white rounded-md transition-colors">
                      <LogOut className="h-4 w-4 mr-3" /> Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded font-medium text-sm transition-all duration-300 shadow-lg shadow-red-600/20 hover:shadow-red-600/40">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white hover:text-gray-300 transition p-1">
              {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute w-full bg-[#141414] border-b border-gray-800 transition-all duration-500 ease-in-out overflow-hidden shadow-2xl ${mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
                   <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <p className="text-white font-medium">{user.name}</p>
                     <p className="text-gray-500 text-xs">{user.email}</p>
                   </div>
                </div>
                {user.role === UserRole.ADMIN && (
                   <Link to="/admin" className="block px-3 py-3 text-base font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-md">
                     <ShieldCheck className="inline-block w-4 h-4 mr-2" />
                     Admin Dashboard
                   </Link>
                )}
                <button onClick={handleLogout} className="block w-full text-left px-3 py-3 text-base font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-md">Sign Out</button>
              </div>
            ) : (
              <Link to="/login" className="block w-full px-3 py-4 text-base font-bold text-white bg-red-600 rounded-md text-center mt-2 shadow-lg">Sign In</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;