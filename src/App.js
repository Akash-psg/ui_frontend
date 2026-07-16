import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Attendance from './components/Attendance';
import Upload from './components/Upload';
import BoxStatus from './components/BoxStatus';
import AddStudent from './components/AddStudent';
import About from './components/About';
import Contact from './components/Contact';
import GenerateReport from './components/GenerateReport'; // Import the GenerateReport component

function App() {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [statusData, setStatusData] = useState([]);
  const [activeSection, setActiveSection] = useState('attendance');
  const [studentName, setStudentName] = useState('');
  const [regNo, setRegNo] = useState('');

  const fetchData = () => {
    fetch('http://localhost:8080/kpcamera/v1/attendance/getAttendance')
      .then((response) => response.json())
      .then((json) => setTableData(json))
      .catch((error) => console.error('Error fetching data:', error));
  };

  const fetchIpStatusData = () => {
    fetch('http://localhost:8080/kpcamera/v1/roomAndIp/getIpAndRoomDetails')
      .then((response) => response.json())
      .then((json) => setStatusData(json))
      .catch((error) => console.error('Error fetching data:', error));
  };

  useEffect(() => {
    fetchData();
    fetchIpStatusData();
  }, []);

  return (
    <div className="App">
      <Header />
      <Sidebar setActiveSection={setActiveSection} />
      <main>
        {activeSection === 'attendance' && <Attendance tableData={tableData} setTableData={setTableData} />}
        {activeSection === 'upload' && <Upload isLoading={isLoading} handleUpload={() => setIsLoading(true)} />}
        {activeSection === 'boxStatus' && <BoxStatus ipAddress={ipAddress} roomNumber={roomNumber} statusData={statusData} />}
        {activeSection === 'addStudent' && <AddStudent />}
        {activeSection === 'about' && <About />}
        {activeSection === 'contact' && <Contact />}
        {activeSection === 'generateReport' && <GenerateReport />} {/* Add GenerateReport section here */}
      </main>

    </div>
  );
}

export default App;
