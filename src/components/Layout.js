
import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

import './Layout.css';

function Layout({ children }) {
  return (
    <div className="layout">
      <TopBar />
      <div className="Container">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
      </div>
    </div>
  )
}

export default Layout;
