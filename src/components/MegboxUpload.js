import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt } from 'react-icons/fa';
import './Dashboard.css';

function MegboxUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleTrigger = () => {
    setIsLoading(true);
    setLastResult(null);

    fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/v1/attendance/triggerUpload`, {
      method: 'GET',
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        return response.json().catch(() => ({}));
      })
      .then((data) => {
        toast.success((data && data.message) || 'Megbox upload triggered successfully.');
        setLastResult(data);
      })
      .catch((error) => {
        console.error('Error triggering Megbox upload:', error);
        toast.error(`An error occurred while triggering the upload: ${error.message}`);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="megbox-upload-section kp-scope">
      <div className="kp-panel-card kp-trigger-card">
        <FaCloudUploadAlt className="kp-trigger-icon" />
        <h2 className="kp-trigger-title">Upload to Megbox</h2>
        <p className="kp-trigger-sub">
          Manually trigger the scheduler to push all pending student photos to Megbox right now.
        </p>

        <button
          onClick={handleTrigger}
          disabled={isLoading}
          className="kp-btn-primary kp-trigger-btn"
        >
          {isLoading ? (
            <span className="kp-btn-loading">
              <span className="kp-spinner kp-spinner--on-btn" />
              Uploading...
            </span>
          ) : (
            'Trigger Upload'
          )}
        </button>

        {lastResult && Object.keys(lastResult).length > 0 && (
          <pre className="kp-trigger-result">{JSON.stringify(lastResult, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}

export default MegboxUpload;