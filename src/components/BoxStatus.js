import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronRight, FaEdit, FaTrash, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Dashboard.css';


function StatusBadge({ color, label }) {
  const toneClass = color === 'green' ? 'kp-pill-up' : color === 'orange' ? 'kp-pill-partial' : 'kp-pill-down';
  return (
    <span className={`kp-pill ${toneClass}`}>
      <span className="kp-pill-dot" />
      {label}
    </span>
  );
}

function BoxStatus({ refreshTrigger, showActions = false, showStats = true }) {
  const [statusData, setStatusData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [editingRowKey, setEditingRowKey] = useState(null);
  const [editedCameraIp, setEditedCameraIp] = useState('');

  const [pendingKey, setPendingKey] = useState(null);
  const [confirmState, setConfirmState] = useState(null); // { message, onConfirm } | null

const getAuditHeaders = () => {
  const stored = localStorage.getItem('user');
  const user = stored ? JSON.parse(stored) : {};
  return {
    'X-User-Email': user.email || '',
    'X-User-Name': user.name || '',
    'X-User-Role': user.role || '',
  };
};

  useEffect(() => {
    fetchMegboxStatus(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, refreshTrigger]);

  const fetchMegboxStatus = (page) => {
    setIsLoading(true);
    fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/megbox/status?page=${page}&size=${pageSize}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.content) {
          setStatusData(data.content);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        } else {
          setStatusData([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching MegBox status:', error);
        toast.error(`An error occurred while fetching MegBox status: ${error.message}`);
      })
      .finally(() => setIsLoading(false));
  };

  // The status API returns campusName/blockName directly (can be null if
  // the megbox was assigned without a matching campus/block).
  const getCampusName = (item) => item.campusName || '-';
  const getBlockName = (item) => item.blockName || '-';

  const getMegboxColor = (item) => {
    if (item.megboxStatus !== 'REACHABLE') return 'red';
    const hasUnreachableCamera = item.cameras.some((camera) => camera.status !== 'REACHABLE');
    return hasUnreachableCamera ? 'orange' : 'green';
  };

  const getCameraColor = (item, camera) => {
    if (item.megboxStatus !== 'REACHABLE') return 'red';
    return camera.status === 'REACHABLE' ? 'green' : 'red';
  };

  const getSeverityRank = (item) => {
    const color = getMegboxColor(item);
    if (color === 'red') return 0;
    if (color === 'orange') return 1;
    return 2;
  };

  // ---- Stat card totals (derived from data already in state; no new fetch) ----
  const totalBoxes = totalElements || statusData.length;
  const onlineBoxes = statusData.filter((item) => getMegboxColor(item) === 'green').length;
  const downBoxes = statusData.filter((item) => getMegboxColor(item) !== 'green').length;

  const filteredStatusData = statusData
    .filter((item) => {
      if (!searchText) return true;
      const text = searchText.toLowerCase();
      return (
        item.megboxIp.toLowerCase().includes(text) ||
        item.cameras.some((camera) => camera.cameraIp.toLowerCase().includes(text))
      );
    })
    .sort((a, b) => getSeverityRank(a) - getSeverityRank(b));

  const toggleRow = (megboxIp) => {
    setExpandedRows((prev) => {
      const updated = new Set(prev);
      if (updated.has(megboxIp)) {
        updated.delete(megboxIp);
      } else {
        updated.add(megboxIp);
      }
      return updated;
    });
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const isSuccessResponse = (data) => {
    if (data === true) return true;
    if (data && typeof data === 'object' && data.success === true) return true;
    return false;
  };

  const getErrorMessage = (data, fallback) => {
    if (data && typeof data === 'object' && data.message) return data.message;
    return fallback;
  };

  const handleEditClick = (e, camera, rowKey) => {
    e.stopPropagation();
    setEditingRowKey(rowKey);
    setEditedCameraIp(camera.cameraIp);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingRowKey(null);
    setEditedCameraIp('');
  };

  const handleUpdateClick = (e, item, camera, rowKey) => {
    e.stopPropagation();

    const trimmedIp = editedCameraIp.trim();

    if (!trimmedIp) {
      toast.error('Camera IP cannot be empty.');
      return;
    }
  
    if (trimmedIp === camera.cameraIp) {
      setEditingRowKey(null);
      setEditedCameraIp('');
      return;
    }

    setPendingKey(rowKey);
    const url = `${process.env.REACT_APP_API_BASE_URL}/v1/megbox/camera?megboxIp=${encodeURIComponent(item.megboxIp)}&cameraIp=${encodeURIComponent(camera.cameraIp)}`;
    fetch(url, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', ...getAuditHeaders() },
  body: JSON.stringify({ newCameraIp: trimmedIp }),
})
      .then(async (response) => {
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (isSuccessResponse(data)) {
          setEditingRowKey(null);
          setEditedCameraIp('');
          toast.success('Camera IP updated successfully.');
          fetchMegboxStatus(currentPage);
        } else {
          toast.error(getErrorMessage(data, 'Failed to update camera.'));
        }
      })
      .catch((error) => {
        console.error('Error updating camera:', error);
        toast.error(`An error occurred while updating the camera: ${error.message}`);
      })
      .finally(() => setPendingKey(null));
  };

  const performDeleteCamera = (item, camera, rowKey) => {
    setPendingKey(rowKey);
    const url = `${process.env.REACT_APP_API_BASE_URL}/v1/megbox/camera?megboxIp=${encodeURIComponent(item.megboxIp)}&cameraIp=${encodeURIComponent(camera.cameraIp)}`;
    fetch(url, { method: 'DELETE', headers: getAuditHeaders() })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (isSuccessResponse(data)) {
          toast.success('Camera deleted successfully.');
          fetchMegboxStatus(currentPage);
        } else {
          toast.error(getErrorMessage(data, 'Failed to delete camera.'));
        }
      })
      .catch((error) => {
        console.error('Error deleting camera:', error);
        toast.error(`An error occurred while deleting the camera: ${error.message}`);
      })
      .finally(() => setPendingKey(null));
  };

  const handleDeleteCamera = (e, item, camera, rowKey) => {
    e.stopPropagation();
    setConfirmState({
      message: `Delete camera ${camera.cameraIp}?`,
      onConfirm: () => performDeleteCamera(item, camera, rowKey),
    });
  };

  const performDeleteMegbox = (item) => {
    const pendingBoxKey = `megbox-${item.megboxIp}`;
    setPendingKey(pendingBoxKey);
    const url = `${process.env.REACT_APP_API_BASE_URL}/v1/megbox?megboxIp=${encodeURIComponent(item.megboxIp)}`;
   fetch(url, { method: 'DELETE', headers: getAuditHeaders() })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (isSuccessResponse(data)) {
          toast.success('MegBox deleted successfully.');
          fetchMegboxStatus(currentPage);
        } else {
          toast.error(getErrorMessage(data, 'Failed to delete MegBox.'));
        }
      })
      .catch((error) => {
        console.error('Error deleting MegBox:', error);
        toast.error(`An error occurred while deleting the MegBox: ${error.message}`);
      })
      .finally(() => setPendingKey(null));
  };

  const handleDeleteMegbox = (e, item) => {
    e.stopPropagation();
    setConfirmState({
      message: `Delete MegBox ${item.megboxIp} and all its assigned cameras?`,
      onConfirm: () => performDeleteMegbox(item),
    });
  };

  // Outer table has: chevron, Megbox IP, Camera IP, Campus, Block, Status, (Actions)
  const outerColSpan = showActions ? 7 : 6;
  // The nested inner table sits inside a single wide cell that spans
  // everything after the chevron column.
  const nestedTdColSpan = showActions ? 6 : 5;

  return (
    <div className="box-status-section kp-scope">
      {/* ---- Stat cards (Total / Online / Down) ---- */}
      {showStats && (
        <div className="kp-stats-row">
          <div className="kp-stat-card kp-stat-c1">
            <div className="kp-stat-label">Total boxes</div>
            <div className="kp-stat-value">{totalBoxes}</div>
          </div>
          <div className="kp-stat-card kp-stat-c2">
            <div className="kp-stat-label">Online</div>
            <div className="kp-stat-value">{onlineBoxes}</div>
          </div>
          <div className="kp-stat-card kp-stat-c3">
            <div className="kp-stat-label">Down</div>
            <div className="kp-stat-value">{downBoxes}</div>
          </div>
        </div>
      )}

      <div className="table-container kp-panel-card">
        <div className="top-controls kp-search-row">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by IP..."
            className="search-box kp-search"
          />
        </div>

        <div className="grouped-table kp-table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Megbox IP</th>
                <th>Camera IP</th>
                <th>Campus</th>
                <th>Block</th>
                <th>Status</th>
                {showActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={outerColSpan}>
                    <div className="kp-loading-row">
                      <span className="kp-spinner" />
                      Loading MegBox data...
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && filteredStatusData.length === 0 && (
                <tr>
                  <td colSpan={outerColSpan}>No MegBox data found.</td>
                </tr>
              )}

              {!isLoading &&
                filteredStatusData.map((item, index) => {
                  const isExpanded = expandedRows.has(item.megboxIp);
                  const megboxPendingKey = `megbox-${item.megboxIp}`;
                  const isMegboxPending = pendingKey === megboxPendingKey;
                  return (
                    <React.Fragment key={index}>
                      <tr
                        onClick={() => toggleRow(item.megboxIp)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          {item.megboxIp}
                        </td>
                        <td>
                          {item.cameras.length} camera{item.cameras.length !== 1 ? 's' : ''}
                        </td>
                        <td>{getCampusName(item)}</td>
                        <td>{getBlockName(item)}</td>
                        <td>
                          <StatusBadge
                            color={getMegboxColor(item)}
                            label={
                              getMegboxColor(item) === 'red'
                                ? 'Down'
                                : getMegboxColor(item) === 'orange'
                                ? 'Partial'
                                : 'Up'
                            }
                          />
                        </td>
                        {showActions && (
                          <td>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteMegbox(e, item)}
                              title="Delete MegBox"
                              disabled={isMegboxPending}
                              className="kp-icon-btn kp-icon-btn--danger"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        )}
                      </tr>

                      {isExpanded && (
                        <tr className="camera-detail-row">
                          <td></td>
                          <td colSpan={nestedTdColSpan}>
                            <table className="kp-nested-table">
                              <thead>
                                <tr>
                                  <th>Camera IP</th>
                                  <th>Room No</th>
                                  <th>Room Id</th>
                                  <th>Status</th>
                                  {showActions && <th>Actions</th>}
                                </tr>
                              </thead>
                              <tbody>
                                {item.cameras.map((camera, idx) => {
                                  const rowKey = `${item.megboxIp}-${camera.cameraIp}-${idx}`;
                                  const isEditing = editingRowKey === rowKey;
                                  const isRowPending = pendingKey === rowKey;
                                  return (
                                    <tr key={idx}>
                                      <td>
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={editedCameraIp}
                                            onChange={(e) => setEditedCameraIp(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            disabled={isRowPending}
                                            className="kp-inline-edit-input"
                                          />
                                        ) : (
                                          camera.cameraIp
                                        )}
                                      </td>
                                      <td>{camera.roomNo || '-'}</td>
                                      <td>{camera.roomId ?? '-'}</td>
                                      <td>
                                        <StatusBadge
                                          color={getCameraColor(item, camera)}
                                          label={getCameraColor(item, camera) === 'green' ? 'Up' : 'Down'}
                                        />
                                      </td>
                                      {showActions && (
                                        <td>
                                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {isEditing ? (
                                              <>
                                                <button
                                                  type="button"
                                                  onClick={(e) => handleUpdateClick(e, item, camera, rowKey)}
                                                  title="Update Camera IP"
                                                  disabled={isRowPending}
                                                  className="kp-icon-btn kp-icon-btn--success"
                                                >
                                                  <FaCheck />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={handleCancelEdit}
                                                  title="Cancel"
                                                  disabled={isRowPending}
                                                  className="kp-icon-btn kp-icon-btn--muted"
                                                >
                                                  &#10005;
                                                </button>
                                              </>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={(e) => handleEditClick(e, camera, rowKey)}
                                                title="Edit Camera IP"
                                                disabled={isRowPending}
                                                className="kp-icon-btn kp-icon-btn--accent"
                                              >
                                                <FaEdit />
                                              </button>
                                            )}
                                            <button
                                              type="button"
                                              onClick={(e) => handleDeleteCamera(e, item, camera, rowKey)}
                                              title="Delete Camera"
                                              disabled={isRowPending}
                                              className="kp-icon-btn kp-icon-btn--danger"
                                            >
                                              <FaTrash />
                                            </button>
                                          </div>
                                        </td>
                                      )}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="kp-pagination">
            <button onClick={handlePrevPage} disabled={currentPage === 0}>
              Prev
            </button>

            <span>
              Page {currentPage + 1} of {totalPages} ({totalElements} total)
            </span>

            <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>
              Next
            </button>
          </div>
        )}
      </div>

      {confirmState && (
        <div className="kp-confirm-overlay" onClick={() => setConfirmState(null)}>
          <div className="kp-confirm-card" onClick={(e) => e.stopPropagation()}>
            <p className="kp-confirm-title">Are you sure want to delete this?</p>
            <p className="kp-confirm-message">{confirmState.message}</p>
            <div className="kp-confirm-actions">
              <button
                type="button"
                className="kp-btn-secondary"
                onClick={() => setConfirmState(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="kp-btn-danger"
                onClick={() => {
                  confirmState.onConfirm();
                  setConfirmState(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoxStatus;