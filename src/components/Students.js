import React, { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import './Dashboard.css';

function Students() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    setIsLoading(true);
    fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/registration/students`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setStudents((data && data.students) || []);
      })
      .catch((error) => {
        console.error('Error fetching students:', error);
      })
      .finally(() => setIsLoading(false));
  };

  const filtered = students.filter((s) => {
    if (!searchText) return true;
    const text = searchText.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(text) ||
      (s.regNo || '').toLowerCase().includes(text)
    );
  });

  return (
    <div className="students-section kp-scope">
      <div className="kp-panel-card">
        <div className="kp-panel-head">
          <h2>Registered Students</h2>
          <span className="kp-hint">{students.length} total</span>
        </div>

        <div className="kp-search-row">
          <div className="kp-search-wrap">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by name or reg no..."
              className="search-box kp-search"
            />
            {searchText && (
              <button
                type="button"
                className="kp-search-clear"
                onClick={() => setSearchText('')}
                aria-label="Clear search"
              >
                &#10005;
              </button>
            )}
          </div>
        </div>

        <div className="kp-table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Photo</th>
                <th>Reg No</th>
                <th>Name</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4}>
                    <div className="kp-loading-row">
                      <span className="kp-spinner" />
                      Loading students...
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="kp-empty-state">
                      <FaUserCircle className="kp-empty-icon" />
                      {searchText ? (
                        <>
                          <p className="kp-empty-title">No matches for "{searchText}"</p>
                          <p className="kp-empty-sub">Try a different name or reg no.</p>
                        </>
                      ) : (
                        <>
                          <p className="kp-empty-title">No students registered yet</p>
                          <p className="kp-empty-sub">Add students via CSV, ZIP, or manual entry.</p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading &&
                filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.photo && s.photo.startsWith('data:') ? (
                        <img src={s.photo} alt={s.name} className="kp-student-thumb" />
                      ) : (
                        <div className="kp-student-thumb kp-student-thumb--placeholder">
                          <FaUserCircle />
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 700 }}>{s.regNo}</td>
                    <td>{s.name}</td>
                    <td>
                      <span className={`kp-pill ${s.source === 'CSV' ? 'kp-pill-partial' : 'kp-pill-up'}`}>
                        <span className="kp-pill-dot" />
                        {s.source}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Students;