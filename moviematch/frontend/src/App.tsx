import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import GameMode from './pages/GameMode';
import Catalog from './pages/Catalog';
import MovieDetail from './pages/MovieDetail';
import Favorites from './pages/Favorites';
import Watchlist from './pages/Watchlist';
import History from './pages/History';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/game" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/game" element={<ProtectedRoute><GameMode /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
