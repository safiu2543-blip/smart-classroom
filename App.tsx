
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DB } from './services/db';
import { User, UserRole } from './types';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseDetails from './pages/CourseDetails';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(DB.getAuthUser());

  const handleLogin = (u: User) => {
    setUser(u);
    DB.setAuthUser(u);
  };

  const handleLogout = () => {
    setUser(null);
    DB.setAuthUser(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    DB.setAuthUser(updatedUser);
    const users = DB.getUsers();
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    DB.saveUsers(updatedUsers);
  };

  // Apply dynamic theme color
  useEffect(() => {
    const color = user?.themeColor || '#4f46e5'; // Default indigo-600
    document.documentElement.style.setProperty('--primary-color', color);
    // Rough calculation for a lighter/darker variant
    document.documentElement.style.setProperty('--primary-color-light', color + '22');
  }, [user?.themeColor]);

  return (
    <HashRouter>
      <style>{`
        :root {
          --primary-color: #4f46e5;
          --primary-color-light: #4f46e522;
        }
        
        .bg-primary { background-color: var(--primary-color); }
        .text-primary { color: var(--primary-color); }
        .border-primary { border-color: var(--primary-color); }
        .ring-primary { --tw-ring-color: var(--primary-color); }
        
        /* Global Input Text Override */
        input, select, textarea {
          color: #000000 !important;
        }

        /* Ensure high contrast for placeholders */
        input::placeholder, textarea::placeholder {
          color: #94a3b8 !important;
          opacity: 1;
        }
        
        /* High-level overrides for consistent branding */
        .btn-primary {
          background-color: var(--primary-color);
          color: white;
          transition: filter 0.2s;
        }
        .btn-primary:hover {
          filter: brightness(1.1);
        }
        .icon-bg {
          background-color: var(--primary-color-light);
          color: var(--primary-color);
        }
      `}</style>
      <div className="min-h-screen flex flex-col relative">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/course/:id" 
              element={user ? <CourseDetails user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={user ? <Profile user={user} onUpdateUser={handleUpdateUser} /> : <Navigate to="/login" />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="bg-white/80 backdrop-blur-md border-t py-8 text-center text-gray-500 text-sm z-10">
          <div className="space-y-1">
            <p className="font-bold text-gray-900 text-base">Safi Ullah</p>
            <p className="font-medium text-gray-600">Student of IMSciences</p>
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-2">
              <a href="mailto:safiu2543@gmail.com" className="text-primary hover:underline transition-colors">safiu2543@gmail.com</a>
              <span className="hidden sm:inline text-gray-300">|</span>
              <a href="tel:+923065083083" className="text-primary hover:underline transition-colors">+923065083083</a>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-4">&copy; {new Date().getFullYear()} Attendance Management Portal</p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
