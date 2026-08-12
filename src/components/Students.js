import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaUserCircle, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Dashboard.css';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

function Students() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [selectedRegNos, setSelectedRegNos] = useState(new Set());
  const [confirmState, setConfirmState] = useState(null); // { message, onConfirm } | null
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const selectAllRef = useRef(null);

  // Debounce the search box so we don't fire an API call on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1); // reset to page 1 whenever the search term changes
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchText]);

  const fetchStudents = useCallback(() => {
    setIsLoading(true);

    const params = new URLSearchParams({
      page: currentPage,
      limit: PAGE_SIZE,
      search: debouncedSearch,
    });

    fetch(`http://13.201.120.181:8080/v1/registration/students?${params.toString()}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setStudents((data && data.students) || []);
        setTotalCount((data && data.total) || 0);
        setTotalPages((data && data.totalPages) || 1);
      })
      .catch((error) => {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students.');
      })
      .finally(() => setIsLoading(false));
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Keep the "select all" checkbox's indeterminate visual state in sync
  // (native <input> doesn't support this as a prop, only as a DOM property).
  // Scoped to the current page, since that's the only data we hold client-side.
  useEffect(() => {
    if (!selectAllRef.current) return;
    const visibleRegNos = students.map((s) => s.regNo);
    const selectedVisibleCount = visibleRegNos.filter((regNo) => selectedRegNos.has(regNo)).length;
    selectAllRef.current.indeterminate =
      selectedVisibleCount > 0 && selectedVisibleCount < visibleRegNos.length;
  }, [selectedRegNos, students]);

  const toggleSelect = (regNo) => {
    setSelectedRegNos((prev) => {
      const updated = new Set(prev);
      if (updated.has(regNo)) {
        updated.delete(regNo);
      } else {
        updated.add(regNo);
      }
      return updated;
    });
  };

  const toggleSelectAll = () => {
    const visibleRegNos = students.map((s) => s.regNo);
    const allVisibleSelected = visibleRegNos.every((regNo) => selectedRegNos.has(regNo));

    setSelectedRegNos((prev) => {
      const updated = new Set(prev);
      if (allVisibleSelected) {
        visibleRegNos.forEach((regNo) => updated.delete(regNo));
      } else {
        visibleRegNos.forEach((regNo) => updated.add(regNo));
      }
      return updated;
    });
  };

  const performDelete = (regNos) => {
    setIsDeleting(true);

    fetch(`http://13.201.120.181:8080/v1/registration/students`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regNos }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (data && data.status === 'SUCCESS') {
          toast.success(data.message || `${data.deletedCount} of ${data.totalRequested} deleted`);

          if (data.failedRegNos && data.failedRegNos.length > 0) {
            toast.error(`Not found, couldn't delete: ${data.failedRegNos.join(', ')}`);
          }

          setSelectedRegNos((prev) => {
            const updated = new Set(prev);
            regNos.forEach((regNo) => updated.delete(regNo));
            return updated;
          });

          // Data changed server-side — refetch the current page.
          fetchStudents();
        } else {
          toast.error((data && data.message) || 'Failed to delete student(s).');
        }
      })
      .catch((error) => {
        console.error('Error deleting student(s):', error);
        toast.error(`An error occurred while deleting: ${error.message}`);
      })
      .finally(() => setIsDeleting(false));
  };

  const handleDeleteSingle = (regNo, name) => {
    setConfirmState({
      message: `Delete ${name || 'this student'} (Reg No ${regNo})?`,
      onConfirm: () => performDelete([regNo]),
    });
  };

  const handleDeleteSelected = () => {
    const regNos = [...selectedRegNos];
    if (regNos.length === 0) return;

    setConfirmState({
      message:
        regNos.length === 1
          ? `Delete the selected student (Reg No ${regNos[0]})?`
          : `Delete ${regNos.length} selected students?`,
      onConfirm: () => performDelete(regNos),
    });
  };

  const allVisibleSelected =
    students.length > 0 && students.every((s) => selectedRegNos.has(s.regNo));

  const goToPage = (page) => {
    const clamped = Math.min(Math.max(1, page), totalPages);
    if (clamped !== currentPage) {
      setCurrentPage(clamped);
    }
  };

  // Build a compact page-number list: first, last, current +/-1, with ellipses.
 

  return (
    <div className="students-section kp-scope">
      <div className="kp-panel-card">
        <div className="kp-panel-head">
          <h2>Registered Students</h2>
          <span className="kp-hint">{totalCount} total</span>
        </div>

        <div className="kp-search-row kp-search-row--with-action">
          {selectedRegNos.size > 0 && (
            <button
              type="button"
              className="kp-btn-danger kp-delete-selected-btn"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
            >
              <FaTrash /> Delete Selected ({selectedRegNos.size})
            </button>
          )}

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
                <th style={{ width: '34px' }}>
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    className="kp-checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    disabled={students.length === 0}
                    aria-label="Select all students on this page"
                  />
                </th>
                <th style={{ width: '60px' }}>Photo</th>
                <th>Reg No</th>
                <th>Name</th>
                <th>Source</th>
                <th style={{ width: '60px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6}>
                    <div className="kp-loading-row">
                      <span className="kp-spinner" />
                      Loading students...
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && students.length === 0 && (
                <tr>
                  <td colSpan={6}>
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
                students.map((s) => (
                  <tr key={s.id} className={selectedRegNos.has(s.regNo) ? 'kp-row-selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        className="kp-checkbox"
                        checked={selectedRegNos.has(s.regNo)}
                        onChange={() => toggleSelect(s.regNo)}
                        aria-label={`Select ${s.name || s.regNo}`}
                      />
                    </td>
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
                    <td>
                      <button
                        type="button"
                        className="kp-icon-btn kp-icon-btn--danger"
                        onClick={() => handleDeleteSingle(s.regNo, s.name)}
                        disabled={isDeleting}
                        title="Delete student"
                        aria-label={`Delete ${s.name || s.regNo}`}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!isLoading && students.length > 0 && totalPages > 1 && (
  <div className="kp-pagination kp-pagination--centered">
    <button
      type="button"
      className="kp-btn-secondary kp-page-btn"
      onClick={() => goToPage(currentPage - 1)}
      disabled={currentPage === 1}
    >
      Prev
    </button>

    <span className="kp-pagination-info">
      Page {currentPage} of {totalPages} ({totalCount} total)
    </span>

    <button
      type="button"
      className="kp-btn-secondary kp-page-btn"
      onClick={() => goToPage(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      Next
    </button>
  </div>
)}
      </div>

      {confirmState && (
        <div className="kp-confirm-overlay" onClick={() => setConfirmState(null)}>
          <div className="kp-confirm-card" onClick={(e) => e.stopPropagation()}>
            <p className="kp-confirm-title">Are you sure?</p>
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

export default Students;