import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import GameIndex from './pages/GameIndex';
import { useUserStore } from './stores/userStore';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/game"
          element={
            <PrivateRoute>
              <GameIndex />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App; 