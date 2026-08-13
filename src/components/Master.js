import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './Dashboard.css';

function Master() {
  const [campuses, setCampuses] = useState([]);

  const [campusName, setCampusName] = useState('');
  const [campusError, setCampusError] = useState('');

  const [selectedCampusId, setSelectedCampusId] = useState('');
  const [blockName, setBlockName] = useState('');
  const [blockError, setBlockError] = useState('');
  const [blocksForSelectedCampus, setBlocksForSelectedCampus] = useState([]);

  const getAuditHeaders = () => {
    const stored = localStorage.getItem('user');
    const user = stored ? JSON.parse(stored) : {};
    return {
      'X-User-Email': user.email || '',
      'X-User-Name': user.name || '',
      'X-User-Role': user.role || '',
    };
  };

  const isSuccess = (data) => data && data.status === 'SUCCESS';

  const fetchCampuses = () => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/master/campus`, {
      headers: { ...getAuditHeaders() },
    })
      .then((res) => res.json())
      .then((data) => {
        if (isSuccess(data)) {
          setCampuses(data.data || []);
        }
      })
      .catch((err) => console.error('Error fetching campuses:', err));
  };

  const fetchBlocksForCampus = (campusId) => {
    if (!campusId) {
      setBlocksForSelectedCampus([]);
      return;
    }
    fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/master/block?campusId=${campusId}`, {
      headers: { ...getAuditHeaders() },
    })
      .then((res) => res.json())
      .then((data) => {
        if (isSuccess(data)) {
          setBlocksForSelectedCampus(data.data || []);
        }
      })
      .catch((err) => console.error('Error fetching blocks:', err));
  };

  useEffect(() => {
    fetchCampuses();
  }, []);

  useEffect(() => {
    fetchBlocksForCampus(selectedCampusId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampusId]);

  const handleAddCampus = () => {
    if (!campusName.trim()) {
      setCampusError('Campus name is required.');
      return;
    }
    setCampusError('');

    fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/master/campus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuditHeaders(),
      },
      body: JSON.stringify({ campusName: campusName.trim() }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isSuccess(data)) {
          toast.success(data.message || 'Campus saved successfully');
          setCampusName('');
          fetchCampuses();
        } else {
          toast.error((data && data.message) || 'Failed to add campus');
        }
      })
      .catch((err) => {
        console.error('Error adding campus:', err);
        toast.error('An error occurred while adding campus');
      });
  };

  const handleAddBlock = () => {
    if (!selectedCampusId) {
      setBlockError('Please select a campus.');
      return;
    }
    if (!blockName.trim()) {
      setBlockError('Block name is required.');
      return;
    }
    setBlockError('');

    const campus = campuses.find(
      (c) => String(c.id) === String(selectedCampusId)
    );
    if (!campus) {
      toast.error('Selected campus not found. Please re-select.');
      return;
    }

    fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/master/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuditHeaders(),
      },
      body: JSON.stringify({
        campusName: campus.campusName,
        blockName: blockName.trim(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isSuccess(data)) {
          toast.success(data.message || 'Block saved successfully');
          setBlockName('');
          fetchBlocksForCampus(selectedCampusId);
        } else {
          toast.error((data && data.message) || 'Failed to add block');
        }
      })
      .catch((err) => {
        console.error('Error adding block:', err);
        toast.error('An error occurred while adding block');
      });
  };

  return (
    <div className="assign-camera-section kp-scope">
      {/* Campus panel */}
      <div className="kp-panel-card">
        <div className="kp-panel-head">
          <h2>Campus</h2>
          <span className="kp-hint">Add and manage campuses</span>
        </div>

        <div className="grid-container kp-field-row">
          <div className={`kp-field ${campusError ? 'kp-field-invalid' : ''}`}>
            <label>Campus Name:</label>
            <input
              type="text"
              value={campusName}
              onChange={(e) => {
                setCampusName(e.target.value);
                if (campusError) setCampusError('');
              }}
              placeholder="Enter Campus Name"
            />
          </div>
        </div>

        {campusError && <div className="error-message kp-error">{campusError}</div>}

        <div className="action-buttons kp-form-actions">
          <button onClick={handleAddCampus} className="kp-btn-primary">
            Add Campus
          </button>
        </div>
      </div>

      {/* Block panel */}
      <div className="kp-panel-card">
        <div className="kp-panel-head">
          <h2>Block</h2>
          <span className="kp-hint">Add and manage blocks under a campus</span>
        </div>

        <div className="grid-container kp-field-row">
          <div className={`kp-field ${blockError ? 'kp-field-invalid' : ''}`}>
            <label>Campus:</label>
            <select
              value={selectedCampusId}
              onChange={(e) => {
                setSelectedCampusId(e.target.value);
                if (blockError) setBlockError('');
              }}
            >
              <option value="">Select Campus</option>
              {campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.campusName}
                </option>
              ))}
            </select>
          </div>

          <div className={`kp-field ${blockError ? 'kp-field-invalid' : ''}`}>
            <label>Block Name:</label>
            <input
              type="text"
              value={blockName}
              onChange={(e) => {
                setBlockName(e.target.value);
                if (blockError) setBlockError('');
              }}
              placeholder="Enter Block Name"
              disabled={!selectedCampusId}
            />
          </div>
        </div>

        {blockError && <div className="error-message kp-error">{blockError}</div>}

        <div className="action-buttons kp-form-actions">
          <button onClick={handleAddBlock} className="kp-btn-primary">
            Add Block
          </button>
        </div>

        <table className="kp-table">
          <thead>
            <tr>
              <th>Block Name</th>
            </tr>
          </thead>
          <tbody>
            {!selectedCampusId ? (
              <tr>
                <td>Select a campus to view its blocks</td>
              </tr>
            ) : blocksForSelectedCampus.length === 0 ? (
              <tr>
                <td>No blocks added yet for this campus</td>
              </tr>
            ) : (
              blocksForSelectedCampus.map((block) => (
                <tr key={block.id}>
                  <td>{block.blockName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Master;