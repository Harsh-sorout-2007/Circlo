import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import './MainLayout.css';

export const MainLayout = ({ children, sidebar, header }) => {
  return (
    <div className="main-layout">
      <Navbar />
      {header && <div className="main-header">{header}</div>}
      <div className="main-container">
        <main className="main-content">
          {children}
        </main>
        <Sidebar>{sidebar}</Sidebar>
      </div>
    </div>
  );
};