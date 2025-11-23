import React, { useState, useRef } from 'react';
import { useAuth } from '../services/authContext';
import { Camera, User, Lock, Mail, Save, AlertCircle, CheckCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Form States
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setMessage({ type: 'error', text: 'Image size should be less than 2MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await updateProfile({ name, avatarUrl });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: "Passwords don't match" });
      setIsLoading(false);
      return;
    }

    try {
      await updateProfile({ email, password: password || undefined });
      setMessage({ type: 'success', text: 'Security settings updated successfully!' });
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update settings' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-28 min-h-screen px-4 pb-20 bg-[#020617]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-2">
             <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-6 py-4 rounded-xl font-medium transition-all flex items-center gap-3 ${activeTab === 'profile' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20' : 'text-gray-400 hover:bg-[#1e293b] hover:text-white'}`}
             >
                <User className="w-5 h-5" /> Profile
             </button>
             <button 
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-6 py-4 rounded-xl font-medium transition-all flex items-center gap-3 ${activeTab === 'security' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20' : 'text-gray-400 hover:bg-[#1e293b] hover:text-white'}`}
             >
                <Lock className="w-5 h-5" /> Security
             </button>
          </div>

          {/* Content Area */}
          <div className="flex-1">
             <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-xl">
                
                {message && (
                  <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                     {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                     {message.text}
                  </div>
                )}

                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileUpdate} className="space-y-8 animate-fade-in">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
                       <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#0f172a] shadow-2xl relative">
                              {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-4xl font-bold text-white">
                                  {user?.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Camera className="w-8 h-8 text-white" />
                              </div>
                          </div>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                       </div>
                       
                       <div className="flex-1 space-y-4 w-full">
                          <div className="space-y-2">
                             <label className="text-sm text-gray-400 font-medium">Display Name</label>
                             <input 
                               type="text" 
                               value={name}
                               onChange={(e) => setName(e.target.value)}
                               className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                             />
                          </div>
                          <p className="text-xs text-gray-500">This name will appear on your reviews and dashboard.</p>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex justify-end">
                       <button 
                         type="submit" 
                         disabled={isLoading}
                         className="bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                       >
                         {isLoading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                       </button>
                    </div>
                  </form>
                )}

                {activeTab === 'security' && (
                   <form onSubmit={handleSecurityUpdate} className="space-y-6 animate-fade-in">
                      <div className="space-y-2">
                          <label className="text-sm text-gray-400 font-medium flex items-center gap-2"><Mail className="w-4 h-4"/> Email Address</label>
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all"
                          />
                      </div>

                      <div className="pt-4 border-t border-white/5">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Lock className="w-4 h-4"/> Change Password</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500">New Password</label>
                                <input 
                                  type="password" 
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all"
                                  placeholder="Leave blank to keep current"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500">Confirm New Password</label>
                                <input 
                                  type="password" 
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-all"
                                  placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 flex justify-end">
                       <button 
                         type="submit" 
                         disabled={isLoading}
                         className="bg-violet-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-violet-700 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-violet-900/20"
                       >
                         {isLoading ? 'Updating...' : <><Save className="w-4 h-4" /> Update Security</>}
                       </button>
                    </div>
                   </form>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;