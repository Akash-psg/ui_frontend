import React from 'react';
import './Dashboard.css';

function Header({ user, onLogout, onToggleSidebar, isSidebarOpen }) {
  return (
    <header className={`kp-header ${isSidebarOpen ? '' : 'header-sidebar-closed'}`}>
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="kp-header-toggle"
      >
        &#9776;
      </button>
      <h1 className="kp-header-title">Dashboard</h1>
      {user ? (
        <div className="kp-header-user">
          <button onClick={onLogout} className="kp-header-logout">
            Logout
          </button>
        </div>
      ) : (
        <div />
      )}
    </header>
  );
}

export default Header;