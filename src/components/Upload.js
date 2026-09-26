import React, { useState } from 'react';

function Upload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // To store any error messages

  // Function to call the GET API when the button is clicked
  const handleUpload = async () => {
    setIsLoading(true);  // Start loading state
    setError(null);  // Reset any previous errors

    try {
      const response = await fetch('http://3.110.42.234:8080/kpcamera/v1/attendance/uploadImages');  // Replace with your actual GET API endpoint
      if (response.ok) {
        console.log("Data fetched successfully:");  // Optional: Log the fetched data
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);  // Handle errors by setting error state
      console.error("Error during fetch:", err);
    } finally {
      setIsLoading(false);  // Stop loading state
    }
  };

  return (
    <div>
      <button onClick={handleUpload} disabled={isLoading}>
        {isLoading ? 'Fetching Data...' : 'Upload Images'}
      </button>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}

export default Upload;
