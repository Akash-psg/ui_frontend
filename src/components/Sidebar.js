import React from 'react';

function Sidebar({ setActiveSection }) {
  return (
    <nav className="sidebar">
      <ul>
        <li>&nbsp;</li>
        <li><button onClick={() => setActiveSection('attendance')}>Attendance</button></li>
        <li><button onClick={() => setActiveSection('generateReport')}>Generate Report</button></li>
        <li><button onClick={() => setActiveSection('upload')}>Upload Images</button></li>
        <li><button onClick={() => setActiveSection('about')}>About</button></li>
        <li><button onClick={() => setActiveSection('contact')}>Contact</button></li>
        <li><button onClick={() => setActiveSection('boxStatus')}>Show BOX Status</button></li>
        <li><button onClick={() => setActiveSection('addStudent')}>Add Student</button></li>
      </ul>
    </nav>
  );
}

export default Sidebar;
