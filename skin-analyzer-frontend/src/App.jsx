import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/analyze/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(response.data.prediction);
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("An error occurred while analyzing the image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Skin Disease Analyzer</h1>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>
      {result && (
        <div style={{ marginTop: "20px" }}>
          <h2>Result:</h2>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

export default App;