import React, { useState, useEffect } from "react";

function Attendance({ tableData, setTableData }) {
  const [loading, setLoading] = useState(false);
  const [modalImage, setModalImage] = useState(null); // State for image in modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state

  // Called when checkbox status changes
  const onChangeCheckBoxEvent = (e, index) => {
    let res = [...tableData];
    res[index].completed = e.target.checked;
    setTableData(res);
  };

  // Fetch data from API
  const fetchAttendanceData = async () => {
    const apiUrl =
      "http://13.201.120.181:8080/kpcamera/v1/attendance/getAttendanceDemo";

    // Check if the API is a demo API
    const isDemoApi = apiUrl.includes("getAttendanceDemo");

    // Set loading only for real API (not for demo API)
    if (!isDemoApi) {
      setLoading(true);
    }

    try {
      const response = await fetch(apiUrl);
      let data = await response.json();

      // Defensive check: the API is expected to return a plain array.
      // If it ever returns something else (e.g. a paginated wrapper like
      // { content: [...] }, or an error object), fall back safely instead
      // of crashing the whole page.
      if (Array.isArray(data)) {
        setTableData(data);
      } else if (data && Array.isArray(data.content)) {
        console.warn(
          "Attendance API returned a paginated/wrapped response instead of a plain array. Using data.content."
        );
        setTableData(data.content);
      } else {
        console.error(
          "Attendance API returned an unexpected response shape:",
          data
        );
        setTableData([]);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setTableData([]);
    } finally {
      if (!isDemoApi) {
        setLoading(false);
      }
    }
  };

  // Use useEffect to fetch data on mount and update every 20s
  useEffect(() => {
    fetchAttendanceData();
    const intervalId = setInterval(fetchAttendanceData, 20000);
    return () => clearInterval(intervalId);
  }, []);

  // Function to manually refresh data
  const refreshData = async () => {
    fetchAttendanceData();
  };

  // Function to clear the table data
  const clearData = () => {
    setTableData([]);
  };

  // Function to open the modal with clicked image
  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  // Guard against tableData ever being a non-array (e.g. on first render
  // before a fetch completes, or if a parent passes a bad value as a prop)
  const safeTableData = Array.isArray(tableData) ? tableData : [];

  // Calculate checked and unchecked count
  const checkedCount = safeTableData.filter((item) => item.completed).length;
  const uncheckedCount = safeTableData.length - checkedCount;

  return (
    <>
      {/* Display total count, checked count, and unchecked count */}
      <div style={styles.countContainer}>
        <table>
          <tr>
            <td>Total Records: {safeTableData.length}</td>
            <td>✔️ Present: {checkedCount}</td>
            <td>❌ Absent: {uncheckedCount}</td>
          </tr>
        </table>
        
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Register Number</th>
              <th>Student Name</th>
              <th>Student Attendance</th>
              <th>Student Image</th>
            </tr>
          </thead>
          <tbody>
            {safeTableData.length > 0 ? (
              safeTableData.map((item, index) => (
                <tr key={index}>
                  <td>{item.regno}</td>
                  <td>{item.name}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) => onChangeCheckBoxEvent(e, index)}
                    />
                  </td>
                  <td>
                    {item.faceImageURL ? (
                      <img
                        src={item.faceImageURL}
                        alt={`Image of ${item.name}`}
                        style={styles.image}
                        onClick={() => openModal(item.faceImageURL)}
                      />
                    ) : (
                      <span>No image</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={styles.noData}>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal for image */}
      {isModalOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <img
              src={modalImage}
              alt="Larger view"
              style={{ width: "100%", height: "auto" }}
            />
            <button onClick={closeModal} style={styles.closeBtn}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Styling
const styles = {
  countContainer: {
    marginBottom: "10px",
    textAlign: "left",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  image: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    cursor: "pointer",
  },
  noData: {
    textAlign: "center",
    padding: "10px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "gray",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    maxWidth: "80%",
    maxHeight: "80%",
    textAlign: "center",
  },
  closeBtn: {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Attendance;