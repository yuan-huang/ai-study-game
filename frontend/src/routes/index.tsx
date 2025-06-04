import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Game from '../pages/Game';
import MainCity from '../pages/game/MainCity';
import TowerDefense from '../pages/game/TowerDefense';
import StudyRoom from '../pages/game/StudyRoom';
import Shop from '../pages/game/Shop';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/game" element={<Game />}>
        <Route index element={<Navigate to="/game/main" replace />} />
        <Route path="main" element={<MainCity />} />
        <Route path="tower-defense" element={<TowerDefense />} />
        <Route path="study-room" element={<StudyRoom />} />
        <Route path="shop" element={<Shop />} />
      </Route>
      <Route path="/" element={<Navigate to="/game" replace />} />
    </Routes>
  );
};

export default AppRoutes; 