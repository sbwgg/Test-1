import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/authContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Watch from './pages/Watch';
import AdminDashboard from './pages/Admin';
import AdvancedSearch from './pages/AdvancedSearch';
import Settings from './pages/Settings';
import Community from './pages/Community';

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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-[#020617] text-gray-100 font-sans selection:bg-violet-600 selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<AdvancedSearch />} />
              <Route path="/community" element={<Community />} />
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
    </AuthProvider>
  );
};

export default App;