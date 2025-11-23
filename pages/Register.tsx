
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await register(email, name, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#020617] overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px]" />

      <div className="relative z-10 bg-[#1e293b]/50 backdrop-blur-xl p-8 md:p-12 rounded-2xl w-full max-w-[450px] border border-white/10 shadow-2xl animate-scale-in">
        <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 group cursor-pointer">
              <Sparkles className="h-8 w-8 text-violet-500 group-hover:rotate-12 transition-transform" />
              <span className="text-3xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                YUME<span className="text-violet-400 font-light">TV</span>
              </span>
            </Link>
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
            <p className="text-gray-400 text-sm mt-2">Join the community and start watching</p>
        </div>
        
        {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 flex items-center justify-center animate-fade-in font-medium">
                {error}
            </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
           <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full bg-[#0f172a] border border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                placeholder="John Doe"
                required
                />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email</label>
            <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full bg-[#0f172a] border border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                placeholder="name@example.com"
                required
                />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full bg-[#0f172a] border border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                placeholder="Create a strong password"
                required
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 mt-4 shadow-lg shadow-violet-900/20 hover:shadow-violet-900/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
             {isLoading ? (
               <div className="flex items-center justify-center">
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                   Creating Account...
               </div>
            ) : (
                <>Sign Up <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account? 
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-bold ml-1 hover:underline transition-colors">
                Sign in now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
