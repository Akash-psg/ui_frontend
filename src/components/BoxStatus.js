import React, { useState, useEffect } from 'react';
import { FaPlus, FaMinus, FaEdit, FaTrash } from 'react-icons/fa'; // Import icons

function BoxStatus({ ipAddress }) {
  const [localIpAddress, setLocalIpAddress] = useState(ipAddress);
  const [cameraIps, setCameraIps] = useState([{ cameraIp: '', isUp: false }]);
  const [statusData, setStatusData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [editData, setEditData] = useState(null); // State to store the editing data
  const [error, setError] = useState(''); // State to store error message

  useEffect(() => {
    fetchRoomDetails();
  }, []);

  const fetchRoomDetails = () => {
    fetch('http://localhost:8080/kpcamera/v1/roomAndIp/getIpAndRoomDetails')
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setStatusData(data);
        } else {
          alert('Failed to fetch room details');
        }
      })
      .catch((error) => {
        console.error('Error fetching room details:', error);
        alert('An error occurred while fetching room details');
      });
  };

  // Function to validate input fields and check for duplicates
  const validateInputs = () => {
    if (!localIpAddress) {
      setError('Megbox IP is required.');
      return false;
    }

    for (let camera of cameraIps) {
      if (!camera.cameraIp) {
        setError('All Camera IP fields must be filled.');
        return false;
      }
    }

    const cameraIpSet = new Set(cameraIps.map(camera => camera.cameraIp));
    if (cameraIpSet.size !== cameraIps.length) {
      setError('Duplicate Camera IPs are not allowed.');
      return false;
    }

    setError(''); // Clear error if all validations pass
    return true;
  };

  const handleSubmit = () => {
    if (!validateInputs()) {
      return; // Stop the form submission if validation fails
    }

    const requestData = {
      megboxIp: localIpAddress,
      cameras: cameraIps.map((camera) => ({ cameraIp: camera.cameraIp })),
    };

    fetch('http://localhost:8080/v1/megbox/assignCamerasToMegBox', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.success) {
          alert(data.message || 'Cameras assigned to MegBox successfully!');
          fetchRoomDetails();
          resetForm();
        } else {
          const errorMessage = (data && data.message) || 'Failed to assign cameras to MegBox';
          alert(errorMessage);
        }
      })
      .catch((error) => {
        console.error('Error assigning cameras to MegBox:', error);
        alert('An error occurred while assigning cameras to MegBox');
      });
  };

  const resetForm = () => {
    setLocalIpAddress('');
    setCameraIps([{ cameraIp: '', isUp: false }]);
    setEditData(null); // Reset edit data after submission
  };

  const handleEdit = (item) => {
    setEditData(item); // Set the current item to be edited
    setLocalIpAddress(item.ipAddress);
    setCameraIps(item.cameraIps);
  };

  const handleDelete = (id) => {
    // Implement delete functionality here (e.g., calling an API)
    alert('Delete functionality not implemented!');
  };

  const handleRemoveCamera = (index) => {
    const updatedCameraIps = cameraIps.filter((_, i) => i !== index);
    setCameraIps(updatedCameraIps);
  };

  const getLightColor = (isUp) => {
    return isUp ? 'green' : 'red';
  };

  return (
    <div className="box-status-section">
      <div className="grid-container">
        <div>
          <label>Megbox IP:</label>
          <input
            type="text"
            value={localIpAddress}
            onChange={(e) => setLocalIpAddress(e.target.value)}
            placeholder="Enter Megbox IP"
          />
        </div>
      </div>

      <div className="camera-table">
        <table>
          <tbody>
            {cameraIps.map((camera, index) => (
              <tr key={index}>
                <td>
                  <label>Camera IP:</label>
                  <input
                    type="text"
                    value={camera.cameraIp}
                    onChange={(e) => {
                      const newCameraIps = [...cameraIps];
                      newCameraIps[index].cameraIp = e.target.value;
                      setCameraIps(newCameraIps);
                    }}
                    placeholder="Enter Camera IP"
                  />
                </td>
                <td>
                  {cameraIps.length > 1 && (
                    <a href="#" onClick={() => handleRemoveCamera(index)}>
                      <FaMinus />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="camera-buttons">
          <a
            href="#"
            onClick={() =>
              setCameraIps([
                ...cameraIps,
                { cameraIp: '', isUp: false },
              ])
            }
            className="add-icon"
          >
            <FaPlus />
          </a>
        </div>
      </div>

      {/* Display error message */}
      {error && <div className="error-message">{error}</div>}

      <div className="action-buttons">
        <button onClick={handleSubmit}>{editData ? 'Update' : 'Submit'}</button>
        <button onClick={resetForm}>Cancel</button>
      </div>

      <div className="table-container">
        <div className="top-controls">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by IP..."
            className="search-box"
          />
        </div>

        <div className="grouped-table">
          <table>
            <thead>
              <tr>
                <th>Megbox IP</th>
                <th>Camera IP</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {statusData.map((item, index) => (
                <React.Fragment key={index}>
                  {item.cameraIps.map((camera, idx) => (
                    <tr key={idx}>
                      {idx === 0 && (
                        <td rowSpan={item.cameraIps.length} style={{ color: getLightColor(item.isUp) }}>
                          {item.ipAddress}
                        </td>
                      )}
                      <td style={{ color: getLightColor(camera.isUp) }}>{camera.cameraIp}</td>

                      {idx === 0 && (
                        <td rowSpan={item.cameraIps.length}>
                          <a href="#" onClick={() => handleEdit(item)} className="icon-space">
                            <FaEdit />
                          </a>
                          <a href="#" onClick={() => handleDelete(item.id)} className="icon-space">
                            <FaTrash />
                          </a>
                        </td>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BoxStatus;