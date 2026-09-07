import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import './MainLayout.css';

export const MainLayout = ({ children, sidebar }) => {
  return (
    <div className="main-layout">
      <Navbar />
      <div className="main-container">
        <main className="main-content">
          {children}
        </main>
        <Sidebar>{sidebar}</Sidebar>
      </div>
    </div>
  );
};