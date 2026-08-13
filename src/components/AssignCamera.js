import React, { useState, useEffect } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import BoxStatus from './BoxStatus';
import './Dashboard.css';

function AssignCamera() {
  const [localIpAddress, setLocalIpAddress] = useState('');
  const [cameraIps, setCameraIps] = useState([
    { cameraIp: '', roomNo: '', roomId: '', isUp: false }
  ]);
  const [editData, setEditData] = useState(null);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({
    megboxIp: false,
    campus: false,
    block: false,
    cameraIndexes: [],
  });

  // Master data: Campus & Block (cascading dropdown)
  const [campuses, setCampuses] = useState([]);
  const [blocksForSelectedCampus, setBlocksForSelectedCampus] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState('');
  const [selectedBlockName, setSelectedBlockName] = useState('');

  const getAuditHeaders = () => {
    const stored = localStorage.getItem('user');
    const user = stored ? JSON.parse(stored) : {};
    return {
      'X-User-Email': user.email || '',
      'X-User-Name': user.name || '',
      'X-User-Role': user.role || '',
    };
  };

  const isMasterSuccess = (data) => data && data.status === 'SUCCESS';

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/master/campus`, {
      headers: { ...getAuditHeaders() },
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMasterSuccess(data)) {
          setCampuses(data.data || []);
        }
      })
      .catch((err) => console.error('Error fetching campuses:', err));
  }, []);

  // Whenever the selected campus changes, fetch that campus's blocks.
  useEffect(() => {
    if (!selectedCampusId) {
      setBlocksForSelectedCampus([]);
      return;
    }

    fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/master/block?campusId=${selectedCampusId}`, {
      headers: { ...getAuditHeaders() },
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMasterSuccess(data)) {
          setBlocksForSelectedCampus(data.data || []);
        }
      })
      .catch((err) => console.error('Error fetching blocks:', err));
  }, [selectedCampusId]);

  const selectedCampus = campuses.find(
    (c) => String(c.id) === String(selectedCampusId)
  );
  const selectedCampusName = selectedCampus ? selectedCampus.campusName : '';

  const validateInputs = () => {
    if (!localIpAddress) {
      setError('Megbox IP is required.');
      setFieldErrors({ megboxIp: true, campus: false, block: false, cameraIndexes: [] });
      return false;
    }

    if (!selectedCampusId) {
      setError('Campus is required.');
      setFieldErrors({ megboxIp: false, campus: true, block: false, cameraIndexes: [] });
      return false;
    }

    if (!selectedBlockName) {
      setError('Block is required.');
      setFieldErrors({ megboxIp: false, campus: false, block: true, cameraIndexes: [] });
      return false;
    }

    const emptyIndexes = cameraIps
      .map((camera, index) => (!camera.cameraIp ? index : null))
      .filter((index) => index !== null);

    if (emptyIndexes.length > 0) {
      setError('All Camera IP fields must be filled.');
      setFieldErrors({ megboxIp: false, campus: false, block: false, cameraIndexes: emptyIndexes });
      return false;
    }

    const seen = new Map();
    cameraIps.forEach((camera, index) => {
      if (seen.has(camera.cameraIp)) {
        seen.get(camera.cameraIp).push(index);
      } else {
        seen.set(camera.cameraIp, [index]);
      }
    });
    const duplicateIndexes = [...seen.values()].filter((indexes) => indexes.length > 1).flat();

    if (duplicateIndexes.length > 0) {
      setError('Duplicate Camera IPs are not allowed.');
      setFieldErrors({ megboxIp: false, campus: false, block: false, cameraIndexes: duplicateIndexes });
      return false;
    }

    setError('');
    setFieldErrors({ megboxIp: false, campus: false, block: false, cameraIndexes: [] });
    return true;
  };

  const handleSubmit = () => {
    if (!validateInputs()) {
      return;
    }

    // Backend expects campusName / blockName as plain text (selected from
    // the dropdowns), NOT ids. It resolves the ids internally.
    const requestData = {
      megboxIp: localIpAddress,
      campusName: selectedCampusName,
      blockName: selectedBlockName,
      cameras: cameraIps.map((camera) => ({
        cameraIp: camera.cameraIp,
        roomNo: camera.roomNo,
        roomId: camera.roomId,
      })),
    };

    fetch(
      `${process.env.REACT_APP_API_BASE_URL}/v1/megbox/assignCamerasToMegBox`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuditHeaders(),
        },
        body: JSON.stringify(requestData),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data && data.success) {
          toast.success(
            data.message ||
              'Cameras assigned to MegBox successfully!'
          );

          resetForm();
          setRefreshTrigger((prev) => prev + 1);
        } else {
          const errorMessage =
            (data && data.message) ||
            'Failed to assign cameras to MegBox';

          toast.error(errorMessage);
        }
      })
      .catch((error) => {
        console.error(
          'Error assigning cameras to MegBox:',
          error
        );

        toast.error(
          'An error occurred while assigning cameras to MegBox'
        );
      });
  };

  const resetForm = () => {
    setLocalIpAddress('');
    setSelectedCampusId('');
    setSelectedBlockName('');
    setBlocksForSelectedCampus([]);

    setCameraIps([
      {
        cameraIp: '',
        roomNo: '',
        roomId: '',
        isUp: false
      }
    ]);

     setEditData(null);
    setError('');
    setFieldErrors({ megboxIp: false, campus: false, block: false, cameraIndexes: [] });
  };

  const handleRemoveCamera = (index) => {
    const updatedCameraIps = cameraIps.filter(
      (_, i) => i !== index
    );

    setCameraIps(updatedCameraIps);
  };

  return (
    <div className="assign-camera-section kp-scope">

      <div className="kp-panel-card">
        <div className="kp-panel-head">
          <h2>Megbox</h2>

          <span className="kp-hint">
            Parent device this camera belongs to
          </span>
        </div>

        <div className="grid-container kp-field-row">
          <div className={`kp-field ${fieldErrors.megboxIp ? 'kp-field-invalid' : ''}`}>
            <label>Megbox IP:</label>

            <input
              type="text"
              value={localIpAddress}
              onChange={(e) => {
                setLocalIpAddress(e.target.value);
                if (fieldErrors.megboxIp) {
                  setFieldErrors((prev) => ({ ...prev, megboxIp: false }));
                }
              }}
              placeholder="Enter Megbox IP"
            />
          </div>

          <div className={`kp-field ${fieldErrors.campus ? 'kp-field-invalid' : ''}`}>
            <label>Campus:</label>

            <select
              value={selectedCampusId}
              onChange={(e) => {
                setSelectedCampusId(e.target.value);
                // reset block whenever campus changes, since blocks are
                // fetched per-campus (cascading dropdown)
                setSelectedBlockName('');
                if (fieldErrors.campus) {
                  setFieldErrors((prev) => ({ ...prev, campus: false }));
                }
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

          <div className={`kp-field ${fieldErrors.block ? 'kp-field-invalid' : ''}`}>
            <label>Block:</label>

            <select
              value={selectedBlockName}
              onChange={(e) => {
                setSelectedBlockName(e.target.value);
                if (fieldErrors.block) {
                  setFieldErrors((prev) => ({ ...prev, block: false }));
                }
              }}
              disabled={!selectedCampusId}
            >
              <option value="">Select Block</option>
              {blocksForSelectedCampus.map((block) => (
                <option key={block.id} value={block.blockName}>
                  {block.blockName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="kp-panel-card">

        <div className="kp-panel-head">
          <h2>Camera details</h2>

          <span className="kp-hint">
            Room mapping for each feed
          </span>
        </div>

        <div className="camera-table kp-camera-table">

          <div className="kp-camera-groups">

            {cameraIps.map((camera, index) => (
              <div className="kp-camera-row" key={index}>

                <div className={`kp-field ${fieldErrors.cameraIndexes.includes(index) ? 'kp-field-invalid' : ''}`}>
                  <label>Camera IP:</label>

                  <input
                    type="text"
                    value={camera.cameraIp}
                    onChange={(e) => {
                      const newCameraIps = [...cameraIps];

                      newCameraIps[index].cameraIp =
                        e.target.value;

                      setCameraIps(newCameraIps);

                      if (fieldErrors.cameraIndexes.includes(index)) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          cameraIndexes: prev.cameraIndexes.filter((i) => i !== index),
                        }));
                      }
                    }}
                    placeholder="Enter Camera IP"
                  />
                </div>

                <div className="kp-field">
                  <label>Room No:</label>

                  <input
                    type="text"
                    value={camera.roomNo}
                    onChange={(e) => {
                      const newCameraIps = [...cameraIps];

                      newCameraIps[index].roomNo =
                        e.target.value;

                      setCameraIps(newCameraIps);
                    }}
                    placeholder="Enter Room No"
                  />
                </div>

                <div className="kp-field">
                  <label>Room Id:</label>

                  <input
                    type="text"
                    value={camera.roomId}
                    onChange={(e) => {
                      const newCameraIps = [...cameraIps];

                      newCameraIps[index].roomId =
                        e.target.value;

                      setCameraIps(newCameraIps);
                    }}
                    placeholder="Enter Room Id"
                  />
                </div>

                <div className="kp-remove-cell">

                  {cameraIps.length > 1 && (
                    <a
                      href="#"
                      onClick={() =>
                        handleRemoveCamera(index)
                      }
                      className="kp-icon-link kp-icon-danger"
                    >
                      <FaMinus />
                    </a>
                  )}

                </div>

              </div>
            ))}

          </div>

          <div className="camera-buttons kp-add-row">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();

                setCameraIps([
                  ...cameraIps,
                  {
                    cameraIp: '',
                    roomNo: '',
                    roomId: '',
                    isUp: false
                  },
                ]);
              }}
              className="kp-icon-link kp-icon-add"
            >
              <FaPlus />
            </a>
          </div>

        </div>

        {error && (
          <div className="error-message kp-error">
            {error}
          </div>
        )}

        <div className="action-buttons kp-form-actions">

          <button
            onClick={handleSubmit}
            className="kp-btn-primary"
          >
            {editData ? 'Update' : 'Submit'}
          </button>

          <button
            onClick={resetForm}
            className="kp-btn-secondary"
          >
            Cancel
          </button>

        </div>

      </div>

      <BoxStatus
        refreshTrigger={refreshTrigger}
        showActions={true}
        showStats={false}
      />

    </div>
  );
}

export default AssignCamera;