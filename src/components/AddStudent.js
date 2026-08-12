import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';

function AddStudent() {
  const [studentName, setStudentName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [id, setId] = useState('');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchGroups();
  }, []);

  const fetchStudents = () => {
    setIsLoading(true);
    fetch('http://13.201.120.181:8080/kpcamera/v1/students/getAllStudent')
      .then((response) => response.json())
      .then((data) => {
        setStudents(data);
        setFilteredStudents(data);
      })
      .catch((error) => {
        console.error('Error fetching student list:', error);
        alert('Failed to fetch students. Please try again later.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchGroups = () => {
    setGroupsLoading(true);
    fetch('http://localhost:8080/kpcamera/v1/roomAndIp/getIpAndRoomDetails')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Extract the groupName from the cameraIps array in the response
          const extractedGroups = data.flatMap(item => 
            item.cameraIps.map(camera => camera.groupName)
          );
          // Remove duplicate group names by converting to a Set and back to an array
          const uniqueGroups = [...new Set(extractedGroups)];
          setGroups(uniqueGroups); // Set unique group names to the groups state
        } else {
          console.error('Invalid groups data:', data);
          setGroups([]); // Fallback if invalid data
        }
      })
      .catch((error) => {
        console.error('Error fetching groups:', error);
        alert('Failed to fetch groups. Please try again later.');
      })
      .finally(() => {
        setGroupsLoading(false);
      });
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    const filtered = students.filter((student) => {
      const name = student.name ? student.name.toLowerCase() : '';
      const regno = student.regno ? student.regno.toLowerCase() : '';
      return name.includes(value.toLowerCase()) || regno.includes(value.toLowerCase());
    });

    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to page 1 after search
  };

  const handleSubmit = () => {
    if (!studentName || !regNo || !groupName) {
      alert('Please fill in all fields, including the group.');
      return;
    }

    const newStudent = {
      id: isEditing,
      name: studentName,
      regno: regNo,
      groupName: groupName,
    };

    setIsLoading(true);

    let url = 'http://13.201.120.181:8080/kpcamera/v1/students/addStudent';
    let method = 'POST';

    if (isEditing) {
      url = `http://13.201.120.181:8080/kpcamera/v1/students/updateStudent/${isEditing}`;
      method = 'PUT';
    }

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newStudent),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          fetchStudents();
          setStudentName('');
          setRegNo('');
          setGroupName('');
          setIsEditing(null);
          alert(isEditing ? 'Student updated successfully!' : 'Student added successfully!');
        } else {
          alert('Failed to submit student: ' + data.message);
        }
      })
      .catch((error) => {
        console.error('Error submitting student:', error);
        alert('Failed to submit student: ' + error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      fetch(`http://13.201.120.181:8080/kpcamera/v1/students/deleteStudent/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          fetchStudents();
          alert('Student deleted successfully!');
        })
        .catch((error) => {
          console.error('Error deleting student:', error);
          alert('Failed to delete student: ' + error.message);
        });
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      const studentsData = data.map(row => ({
        name: row['Name'],
        regno: row['RegNo'],
        groupName: row['GroupName']
      }));
      uploadStudentAPI(studentsData);
    };
    reader.readAsBinaryString(uploadedFile);
  };



  const uploadStudentAPI = (studentsData) => {
    setIsLoading(true);
    fetch('http://13.201.120.181:8080/kpcamera/v1/students/uploadExcelsheet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studentsData)
    })
      .then(response => response.json())
      .then(data => {
        alert('Excel sheet updaload successfully!');
        fetchStudents();
      })
      .catch(error => {
        console.error('Error Excel sheet:', error);
        alert('Failed to upload Excel.');
      }).finally(() => {
        setIsLoading(false);
      });
  };


  const handleEdit = (student) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    setStudentName(student.name);
    setRegNo(student.regno);
    setGroupName(student.groupName); // Set group name for editing
    setIsEditing(student.id);
  };

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="box-status-section">
      <div className="grid-container">
        <div>
          <label>Student Name:</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter Student Name"
            aria-label="Student Name"
          />
        </div>
        <div>
          <label>Reg Number:</label>
          <input
            type="text"
            value={regNo}
            onChange={(e) => setRegNo(e.target.value)}
            placeholder="Enter RegNo Number"
            aria-label="Reg Number"
          />
        </div>

        {/* Group Name Dropdown */}
        <div>
          <label>Group Name:</label>
          {groupsLoading ? (
            <p>Loading groups...</p> // Show loading text while groups are being fetched
          ) : (
            <select value={groupName} onChange={(e) => setGroupName(e.target.value)} aria-label="Select Group">
              <option value="">Select Group</option>
              {groups.length > 0 ? (
                groups.map((group, index) => (
                  <option key={index} value={group}>
                    {group} {/* Display group name */}
                  </option>
                ))
              ) : (
                <option disabled>No groups available</option> // Handle case with no groups
              )}
            </select>
          )}
          <h3 color='red'>&nbsp;</h3>
          <h3 color='red'>&nbsp;</h3>
          <h3 color='red'>&nbsp;</h3>
          <h3 color='red'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h3>
          <h3 color='#007bff'>OR</h3>
        </div>

        <div className="add-student-section">
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
    </div>

      </div>

      <div className="action-buttons">
        <button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Submitting...' : isEditing ? 'Update' : 'Submit'}
        </button>
        <button
          onClick={() => {
            setStudentName('');
            setRegNo('');
            setGroupName('');
            setIsEditing(null);
          }}
        >
          Cancel
        </button>
      </div>

      {/* Pagination and Search Input together */}
      <div className="pagination-and-search">
        <div className="pagination">
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {currentPage}</span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage * studentsPerPage >= filteredStudents.length}
          >
            Next
          </button>
        </div>

        {/* Search Input */}
        <div className="search-section">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by name or reg number"
            aria-label="Search Students"
          />
        </div>
      </div>

      {/* Show the grid count at the top of the grid */}
      <div className="grid-count">
        <p>
          Showing {currentStudents.length} of {filteredStudents.length} students
        </p>
      </div>

      {/* Display the student list in a scrollable table layout */}
      {filteredStudents.length > 0 && (
        <div className="student-grid">
          <div className="scrollable-table">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll/Reg Number</th>
                  <th>Group</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.regno}</td>
                    <td>{student.groupName}</td> {/* Display selected group */}
                    <td className="actions">
                      <input type="hidden" value={student.id} />
                      <a
                        href="#"
                        onClick={() => handleEdit(student)}
                        aria-label="Edit"
                        style={{ marginRight: '10px' }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </a>
                      <a href="#" onClick={() => handleDelete(student.id)} aria-label="Delete">
                        <FontAwesomeIcon icon={faTrash} />
                      </a>
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

export default AddStudent;
