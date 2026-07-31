import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaClipboardList } from 'react-icons/fa';
import './Dashboard.css';

// HTML <input type="date"> gives "2026-07-27" — API wants "27/07/2026"
function formatDateForApi(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

function AttendanceReport() {
  const [cameraIp, setCameraIp] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState(null);

  const handleFetchReport = () => {
    if (!cameraIp || !date || !time) {
      toast.error('Please fill Camera IP, Date, and Time.');
      return;
    }

    setIsLoading(true);

    // <input type="time"> without step="1" gives "HH:mm" — API wants "HH:mm:ss"
    const formattedTime = time.length === 5 ? `${time}:00` : time;

    const params = new URLSearchParams({
      cameraIp,
      startTime: formattedTime,
      startDate: formatDateForApi(date),
    });

    fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/registration/attendance-report?${params.toString()}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setRecords((data && data.records) || []);
      })
      .catch((error) => {
        console.error('Error fetching attendance report:', error);
        toast.error(`An error occurred while fetching the report: ${error.message}`);
        setRecords([]);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="attendance-report-section kp-scope">
      <div className="kp-panel-card">
        <div className="kp-panel-head">
          <h2>Attendance Report</h2>
          <span className="kp-hint">Look up attendance by camera, date and time</span>
        </div>

        <div className="kp-field-row">
          <div className="kp-field">
            <label>Camera IP:</label>
            <input
              type="text"
              value={cameraIp}
              onChange={(e) => setCameraIp(e.target.value)}
              placeholder="e.g. 192.168.9.41"
            />
          </div>
          <div className="kp-field">
            <label>Date:</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="kp-field">
            <label>Time:</label>
            <input type="time" step="1" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>

        <div className="kp-form-actions">
          <button onClick={handleFetchReport} disabled={isLoading} className="kp-btn-primary">
            {isLoading ? (
              <span className="kp-btn-loading">
                <span className="kp-spinner kp-spinner--on-btn" />
                Fetching...
              </span>
            ) : (
              'Get Report'
            )}
          </button>
        </div>
      </div>

      {records !== null && (
        <div className="kp-panel-card">
          <div className="kp-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 && (
                  <tr>
                    <td colSpan={3}>
                      <div className="kp-empty-state">
                        <FaClipboardList className="kp-empty-icon" />
                        <p className="kp-empty-title">No attendance records found</p>
                        <p className="kp-empty-sub">Try a different camera, date, or time.</p>
                      </div>
                    </td>
                  </tr>
                )}

                {records.map((r, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 700 }}>{r.regNo}</td>
                    <td>{r.name}</td>
                    <td>
                      {r.attendanceStatus === 'present' ? (
                        <span className="kp-pill kp-pill-up">
                          <FaCheckCircle /> Present
                        </span>
                      ) : (
                        <span className="kp-pill kp-pill-down">
                          <FaTimesCircle /> Absent
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceReport;