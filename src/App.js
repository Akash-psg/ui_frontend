import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AssignCamera from './components/AssignCamera';
import BoxStatus from './components/BoxStatus';
import Registration from './components/Registration';
import Students from './components/Students';
import MegboxUpload from './components/MegboxUpload';
import AttendanceReport from './components/AttendanceReport';
import Login from './components/Login';

function App() {
  const [activeSection, setActiveSection] = useState('boxStatus');
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
   const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setCheckingSession(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleSelectSection = (section) => {
    setActiveSection(section);
    // Auto-close the sidebar on mobile after picking a section, since it's
    // an overlay drawer there and blocks the page until dismissed. On
    // desktop the sidebar is docked (not an overlay), so leave it open.
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };


  if (checkingSession) {
    return null; // avoid flash of login page while checking localStorage
  }

  if (!user) {
    return (
      <>
        <Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          newestOnTop
          theme="colored"
        />
      </>
    );
  }

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        theme="colored"
      />
      <Header user={user} onLogout={handleLogout} onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
   <Sidebar setActiveSection={handleSelectSection} isOpen={isSidebarOpen} user={user} />
      {isSidebarOpen && (
        <div className="kp-sidebar-backdrop" onClick={toggleSidebar} />
      )}
      <main className={isSidebarOpen ? '' : 'main-sidebar-closed'}>
        {activeSection === 'assignCamera' && <AssignCamera />}
        {activeSection === 'boxStatus' && <BoxStatus />}
        {activeSection === 'registration' && <Registration />}
        {activeSection === 'students' && <Students />}
        {activeSection === 'megboxUpload' && <MegboxUpload />}
        {activeSection === 'attendanceReport' && <AttendanceReport />}
      </main>
    </div>
  );
}

export default App;