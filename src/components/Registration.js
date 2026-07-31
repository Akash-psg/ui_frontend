import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaFileCsv, FaFileArchive, FaUserPlus } from 'react-icons/fa';
import './Dashboard.css';

function Registration() {
  // ---- Section A: CSV bulk upload ----
  const [csvFile, setCsvFile] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvResult, setCsvResult] = useState(null);

  // ---- Section B: ZIP photo upload ----
  const [zipFile, setZipFile] = useState(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipResult, setZipResult] = useState(null);

  // ---- Section C: manual registration ----
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const photoInputRef = useRef(null);
  const [manualLoading, setManualLoading] = useState(false);

  const handleCsvUpload = () => {
    if (!csvFile) return;
    setCsvLoading(true);
    setCsvResult(null);

    const formData = new FormData();
    formData.append('file', csvFile);

    fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/registration/csv-upload`, {
      method: 'POST',
      body: formData,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (data && data.status === 'SUCCESS') {
          toast.success(data.message || 'CSV processed successfully.');
          setCsvResult(data);
          setCsvFile(null);
        } else {
          toast.error((data && data.message) || 'Failed to process CSV.');
        }
      })
      .catch((error) => {
        console.error('Error uploading CSV:', error);
        toast.error(`An error occurred while uploading the CSV: ${error.message}`);
      })
      .finally(() => setCsvLoading(false));
  };

  const handleZipUpload = () => {
    if (!zipFile) return;
    setZipLoading(true);
    setZipResult(null);

    const formData = new FormData();
    formData.append('file', zipFile);

    fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/registration/photo-upload`, {
      method: 'POST',
      body: formData,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (data && data.status === 'SUCCESS') {
          toast.success(data.message || 'Photos uploaded successfully.');
          setZipResult(data);
          setZipFile(null);
        } else {
          toast.error((data && data.message) || 'Failed to process photo ZIP.');
        }
      })
      .catch((error) => {
        console.error('Error uploading ZIP:', error);
        toast.error(`An error occurred while uploading the ZIP: ${error.message}`);
      })
      .finally(() => setZipLoading(false));
  };

  // Same FileReader conversion is used both to show the live preview
  // and, later, to send the exact value in the /register JSON body.
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoBase64('');
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const resetManualForm = () => {
    setName('');
    setRegNo('');
    handleRemovePhoto();
  };

  const handleManualSubmit = () => {
    if (!name) {
      toast.error('Name is required.');
      return;
    }

    setManualLoading(true);

    const requestData = {
      name,
      ...(regNo ? { regNo } : {}),
      ...(photoBase64 ? { photo: photoBase64 } : {}),
    };

    fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/registration/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (data && data.status === 'SUCCESS') {
          toast.success(data.message || 'Student registered successfully.');
          resetManualForm();
        } else {
          toast.error((data && data.message) || 'Registration failed.');
        }
      })
      .catch((error) => {
        console.error('Error registering student:', error);
        toast.error(`An error occurred while registering the student: ${error.message}`);
      })
      .finally(() => setManualLoading(false));
  };

  return (
    <div className="registration-section kp-scope">

      {/* ---- Section A: CSV Bulk Upload ---- */}
      <div className="kp-panel-card">
        <div className="kp-panel-head">
          <h2><FaFileCsv className="kp-panel-icon" /> CSV Bulk Upload</h2>
          <span className="kp-hint">Upload student name &amp; reg no from a spreadsheet</span>
        </div>

        <div className="kp-upload-row">
          <label className="kp-file-label">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0] || null)}
              className="kp-file-input-hidden"
            />
            Choose CSV file
          </label>
          <span className="kp-file-name">{csvFile ? csvFile.name : 'No file chosen'}</span>
        </div>

        <div className="kp-form-actions">
          <button
            onClick={handleCsvUpload}
            disabled={!csvFile || csvLoading}
            className="kp-btn-primary"
          >
            {csvLoading ? (
              <span className="kp-btn-loading">
                <span className="kp-spinner kp-spinner--on-btn" />
                Uploading...
              </span>
            ) : (
              'Upload CSV'
            )}
          </button>
        </div>

        {csvResult && (
          <div className="kp-result-banner">
            <div className="kp-result-stat">
              <span>{csvResult.totalRows}</span>
              Total rows
            </div>
            <div className="kp-result-stat kp-result-stat--success">
              <span>{csvResult.insertedRows}</span>
              Inserted
            </div>
            <div className={`kp-result-stat ${csvResult.skippedRows > 0 ? 'kp-result-stat--danger' : ''}`}>
              <span>{csvResult.skippedRows}</span>
              Skipped
            </div>
          </div>
        )}
      </div>

      {/* ---- Section B: ZIP Photo Upload ---- */}
      <div className="kp-panel-card">
        <div className="kp-panel-head">
          <h2><FaFileArchive className="kp-panel-icon" /> Photo ZIP Upload</h2>
          <span className="kp-hint">Bulk photos for students already registered</span>
        </div>

        <div className="kp-upload-row">
          <label className="kp-file-label">
            <input
              type="file"
              accept=".zip"
              onChange={(e) => setZipFile(e.target.files[0] || null)}
              className="kp-file-input-hidden"
            />
            Choose ZIP file
          </label>
          <span className="kp-file-name">{zipFile ? zipFile.name : 'No file chosen'}</span>
        </div>

        <div className="kp-form-actions">
          <button
            onClick={handleZipUpload}
            disabled={!zipFile || zipLoading}
            className="kp-btn-primary"
          >
            {zipLoading ? (
              <span className="kp-btn-loading">
                <span className="kp-spinner kp-spinner--on-btn" />
                Uploading...
              </span>
            ) : (
              'Upload ZIP'
            )}
          </button>
        </div>

        {zipResult && (
          <>
            <div className="kp-result-banner">
              <div className="kp-result-stat">
                <span>{zipResult.totalFiles}</span>
                Total files
              </div>
              <div className="kp-result-stat kp-result-stat--success">
                <span>{zipResult.savedFiles}</span>
                Saved
              </div>
              <div
                className={`kp-result-stat ${
                  zipResult.failedFiles && zipResult.failedFiles.length > 0
                    ? 'kp-result-stat--danger'
                    : ''
                }`}
              >
                <span>{zipResult.failedFiles ? zipResult.failedFiles.length : 0}</span>
                Failed
              </div>
            </div>

            {zipResult.failedFiles && zipResult.failedFiles.length > 0 && (
              <div className="kp-chip-list">
                {zipResult.failedFiles.map((file, index) => (
                  <span key={index} className="kp-chip kp-chip-danger">
                    {file}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ---- Section C: Manual Registration ---- */}
      <div className="kp-panel-card">
        <div className="kp-panel-head">
          <h2><FaUserPlus className="kp-panel-icon" /> Manual Registration</h2>
          <span className="kp-hint">Register one student right now</span>
        </div>

        <div className="kp-field-row">
          <div className="kp-field">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter student name"
            />
          </div>
          <div className="kp-field">
            <label>
              Reg No: <span className="kp-hint-inline"></span>
            </label>
            <input
              type="text"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              placeholder="Leave blank to auto-generate"
            />
          </div>
        </div>

        <div className="kp-photo-row">
          <label className="kp-file-label">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="kp-file-input-hidden"
            />
            Choose photo
          </label>
          <span className="kp-hint-inline">(optional)</span>

          {photoBase64 && (
            <div className="kp-photo-preview-wrap">
              <img src={photoBase64} alt="Preview" className="kp-photo-preview" />
              <button
                type="button"
                className="kp-photo-remove"
                onClick={handleRemovePhoto}
                aria-label="Remove photo"
              >
                &#10005;
              </button>
            </div>
          )}
        </div>

        <div className="kp-form-actions">
          <button
            onClick={handleManualSubmit}
            disabled={!name || manualLoading}
            className="kp-btn-primary"
          >
            {manualLoading ? (
              <span className="kp-btn-loading">
                <span className="kp-spinner kp-spinner--on-btn" />
                Registering...
              </span>
            ) : (
              'Register'
            )}
          </button>
          <button onClick={resetManualForm} className="kp-btn-secondary">
            Cancel
          </button>
        </div>
      </div>

    </div>
  );
}

export default Registration;