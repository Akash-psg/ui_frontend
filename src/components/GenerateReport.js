import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function GenerateReport() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validation function for checking valid hours, minutes, and seconds
  const isValidTime = (hours, minutes, seconds) => {
    if (hours < 0 || hours > 23) return false;
    if (minutes < 0 || minutes > 59) return false;
    if (seconds < 0 || seconds > 59) return false;
    return true;
  };

  // Function to convert date to IST format
  const convertToIST = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      timeZoneName: 'short',
    });
  };

  // Function to call the API with start and end date
  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    // Extract hours, minutes, and seconds from start and end date
    const startHours = startDate.getHours();
    const startMinutes = startDate.getMinutes();
    const startSeconds = startDate.getSeconds();

    const endHours = endDate.getHours();
    const endMinutes = endDate.getMinutes();
    const endSeconds = endDate.getSeconds();

    // Validate the time for both start and end
    if (!isValidTime(startHours, startMinutes, startSeconds)) {
      alert('Invalid start time. Please enter valid hours, minutes, and seconds.');
      return;
    }

    if (!isValidTime(endHours, endMinutes, endSeconds)) {
      alert('Invalid end time. Please enter valid hours, minutes, and seconds.');
      return;
    }

    setLoading(true);
    setError(null);

    // Convert the startDate and endDate to IST format
    const startIST = convertToIST(startDate);
    const endIST = convertToIST(endDate);

    try {
      // Make the GET API request with the start and end date as query params
      const response = await fetch(
        `http://localhost:8080/kpcamera/v1/report/generateReportDemo?start=${encodeURIComponent(startIST)}&end=${encodeURIComponent(endIST)}`
      );

      // Check if the response is ok (status code 200-299)
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      // Trigger the download of the file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'Recognizedreport.xlsx';
      link.click();
    } catch (error) {
      setError(error.message); // Set error message if something goes wrong
    } finally {
      setLoading(false); // Set loading to false after the request is completed
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Generate Report</h2>

      {/* Date Picker Section with Time (Hours, Minutes, Seconds) */}
      <div style={dateContainerStyle}>
        <div style={datePickerStyle}>
          <label style={labelStyle}>Start Date & Time:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect
            showTimeSelectOnly={false}
            timeFormat="HH:mm:ss"
            timeIntervals={1}
            dateFormat="yyyy/MM/dd HH:mm:ss"
            placeholderText="Select Start Date & Time"
            style={inputStyle}
          />
        </div>

        <div style={datePickerStyle}>
          <label style={labelStyle}>End Date & Time:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            showTimeSelectOnly={false}
            timeFormat="HH:mm:ss"
            timeIntervals={1}
            dateFormat="yyyy/MM/dd HH:mm:ss"
            placeholderText="Select End Date & Time"
            style={inputStyle}
          />
        </div>
      </div>

      <button onClick={generateReport} style={buttonStyle}>Generate Report</button>

      {loading && <p style={loadingTextStyle}>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

const containerStyle = {
  padding: '20px',
  maxWidth: '800px',
  margin: '0 auto',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '30px',
  color: '#343a40',
};

const dateContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '20px',
  marginBottom: '20px',
};

const datePickerStyle = {
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
};

const labelStyle = {
  fontWeight: 'bold',
  marginBottom: '10px',
  color: '#495057',
};

const inputStyle = {
  padding: '10px',
  fontSize: '14px',
  borderRadius: '5px',
  border: '1px solid #ced4da',
};

const buttonStyle = {
  marginTop: '20px',
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  width: '100%',
};

const loadingTextStyle = {
  textAlign: 'center',
  color: '#007bff',
  fontSize: '18px',
};

export default GenerateReport;
