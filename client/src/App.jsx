import { useState } from "react";
import axios from "axios";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Send image to Flask backend
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
    <div className="App">
      <h1>VisageCheck - Skin Analyzer</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Analyze</button>

      {prediction && (
        <div>
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
