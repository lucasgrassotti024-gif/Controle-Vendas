import React from 'react';
import { Navbar, PageId } from './Navbar';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  activePage: PageId;
  onPageChange: (page: PageId) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onPageChange }) => {
  return (
    <div className="layout-root">
      <Navbar activePage={activePage} onPageChange={onPageChange} />
      <main className="layout-content">
        <div className="layout-container">
          {children}
        </div>
      </main>
    </div>
  );
};
