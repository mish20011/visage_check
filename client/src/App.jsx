import { useState } from "react";
import axios from "axios";
import "./style.css";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:8080/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPrediction(response.data.prediction);
      fetchRecommendations(response.data.prediction);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const fetchRecommendations = async (condition) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8080/recommendations/${condition}`);
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div className="logo">
          {/* Optional logo image */}
          {/* <img src="logo.png" alt="Logo" className="logo-img" /> */}
          <span className="webapp-name">VisageCheck - Skin Analyzer</span>
        </div>
      </div>

      {/* Upload Form */}
      <div className="upload-form">
        <label className="upload-label">Upload a facial image:</label>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Analyze</button>

        {/* Image Preview */}
        {previewUrl && (
          <div className="image-preview">
            <h3>Image Preview:</h3>
            <img src={previewUrl} alt="Selected Preview" width="300" />
          </div>
        )}
      </div>

      {/* Results */}
      {prediction && (
        <div className="disease-description">
          <h2>Prediction: {prediction}</h2>
          <h3>Recommended Products:</h3>
          <ul>
            {recommendations.map((item, index) => (
              <li key={index}>
                <a href={item.product_link} target="_blank" rel="noopener noreferrer">
                  <img src={item.product_image} alt={item.product_name} width="100" />
                  <p>{item.product_name}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
