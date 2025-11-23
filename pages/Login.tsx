import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-black overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-cover bg-no-repeat opacity-50 scale-105">
         <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-black via-transparent to-black"></div>
      </div>

      <div className="relative z-10 bg-black/75 backdrop-blur-md p-12 md:p-16 rounded-xl w-full max-w-[450px] border border-white/10 shadow-2xl animate-scale-in">
        <h2 className="text-3xl font-bold text-white mb-8">Sign In</h2>
        
        {error && <div className="bg-[#e87c03] text-white p-3 rounded text-sm mb-6 animate-fade-in font-medium">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block px-4 pb-2.5 pt-5 w-full text-white bg-[#333] rounded-md focus:outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-red-600 peer transition-all"
              placeholder=" "
              required
            />
            <label htmlFor="email" className="absolute text-gray-400 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-gray-200">
                Email address
            </label>
          </div>
          
          <div className="relative group">
            <input
              type="password"
              id="password"
              className="block px-4 pb-2.5 pt-5 w-full text-white bg-[#333] rounded-md focus:outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-red-600 peer transition-all"
              placeholder=" "
            />
             <label htmlFor="password" className="absolute text-gray-400 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-gray-200">
                Password
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-md transition-all duration-300 disabled:opacity-50 mt-8 shadow-lg shadow-black/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
               <div className="flex items-center justify-center">
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                   Signing In...
               </div>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-12 text-gray-400 text-sm">
          <p className="mb-6">
            New to YumeTV? <Link to="/register" className="text-white hover:underline font-medium ml-1">Sign up now.</Link>
          </p>
          <div className="text-xs text-gray-500 pt-6 border-t border-gray-700">
            <p className="mb-2 uppercase tracking-widest font-bold text-[10px]">Demo Access</p>
            <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                 <span>admin@streamai.com</span>
                 <span className="text-gray-600">password</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;