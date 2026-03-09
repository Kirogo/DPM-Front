// src/components/layout/AuthLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white"  style={{ fontFamily: 'Century Gothic, CenturyGothic, AppleGothic, sans-serif' }}>
      <Outlet />
    </div>
  );
};

export default AuthLayout;