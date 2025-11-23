
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/authContext';
import { SettingsProvider, useSettings } from './services/settingsContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Watch from './pages/Watch';
import AdminDashboard from './pages/Admin';
import AdvancedSearch from './pages/AdvancedSearch';
import Settings from './pages/Settings';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import { Wrench, AlertTriangle } from 'lucide-react';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireAdmin = false }: React.PropsWithChildren<{ requireAdmin?: boolean }>) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#020617] text-white">Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const MaintenanceScreen = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 text-center">
    <div className="bg-violet-600/20 p-6 rounded-full mb-6 animate-pulse">
       <Wrench className="w-16 h-16 text-violet-500" />
    </div>
    <h1 className="text-4xl font-black text-white mb-4">Under Maintenance</h1>
    <p className="text-gray-400 max-w-md text-lg leading-relaxed mb-8">{message}</p>
    <div>
      <Link to="/login" className="text-sm text-gray-500 hover:text-gray-300 underline decoration-gray-700 hover:decoration-gray-300">Admin Login</Link>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();

  if (authLoading || settingsLoading) {
    return <div className="h-screen flex items-center justify-center bg-[#020617] text-white">Loading...</div>;
  }

  // Maintenance Logic: 
  // If maintenance is ON and user is NOT ADMIN -> Show maintenance screen for all routes except /login and /admin
  const isMaintenance = settings.maintenanceMode && user?.role !== 'ADMIN';

  if (isMaintenance) {
      return (
          <HashRouter>
            <Routes>
                {/* Allow Admin/Login Access */}
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={
                    <ProtectedRoute requireAdmin={true}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                
                {/* All other routes redirected to Maintenance */}
                <Route path="*" element={<MaintenanceScreen message={settings.maintenanceMessage} />} />
            </Routes>
          </HashRouter>
      );
  }

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-[#020617] text-gray-100 font-sans selection:bg-violet-600 selection:text-white">
        
        {/* Global Notification Banner */}
        {settings.showNotification && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-200 px-4 py-3 text-center text-sm font-medium flex items-center justify-center gap-3 relative z-[60] animate-fade-in">
             <AlertTriangle className="w-4 h-4 text-yellow-500" />
             <span>{settings.notificationMessage}</span>
          </div>
        )}

        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<AdvancedSearch />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/post/:id" element={<PostDetail />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/watch/:id" element={
              <ProtectedRoute>
                <Watch />
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <footer className="py-8 text-center text-gray-500 text-sm border-t border-white/5 mt-12 bg-[#020617]">
          <p>© 2024 YumeTV. All rights reserved.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
