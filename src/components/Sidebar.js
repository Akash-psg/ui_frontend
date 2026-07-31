import React from 'react';
import {
  FaVideo,
  FaClipboardList,
  FaUserPlus,
  FaUsers,
  FaCloudUploadAlt,
  FaChartBar,
} from 'react-icons/fa';
import './Dashboard.css';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function Sidebar({ setActiveSection, isOpen, user }) {
  return (
    <nav className={`sidebar kp-sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <ul>
        <li>&nbsp;</li>
        <li>
          <button onClick={() => setActiveSection('assignCamera')}>
            <FaVideo className="kp-nav-icon" />
            Assign Camera
          </button>
        </li>
        <li>
          <button onClick={() => setActiveSection('boxStatus')}>
            <FaClipboardList className="kp-nav-icon" />
            Show BOX Status
          </button>
        </li>
        <li>
          <button onClick={() => setActiveSection('registration')}>
            <FaUserPlus className="kp-nav-icon" />
            Register Student
          </button>
        </li>
        <li>
          <button onClick={() => setActiveSection('students')}>
            <FaUsers className="kp-nav-icon" />
            Students List
          </button>
        </li>
        <li>
          <button onClick={() => setActiveSection('megboxUpload')}>
            <FaCloudUploadAlt className="kp-nav-icon" />
            Upload to Megbox
          </button>
        </li>
        <li>
          <button onClick={() => setActiveSection('attendanceReport')}>
            <FaChartBar className="kp-nav-icon" />
            Attendance Report
          </button>
        </li>
      </ul>

      {user && (
        <div className="kp-sidebar-profile">
          <div className="kp-sidebar-avatar">{getInitials(user.name)}</div>
          <div className="kp-sidebar-profile-text">
            <span className="kp-sidebar-name">{user.name}</span>
            <span className="kp-sidebar-role">{user.role}</span>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Sidebar;