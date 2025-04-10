import { useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import ImageUploader from "./components/ImageUploader";
import PredictionDisplay from "./components/PredictionDisplay";
import RecommendationsAccordion from "./components/RecommendationsAccordion";
// Using ArrowPathIcon for a more similar loading animation to HuggingFace
import { ArrowPathIcon } from '@heroicons/react/24/outline';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [probabilities, setProbabilities] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (file) => {
    setSelectedFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
    // Reset prediction when a new file is selected
    setPrediction(null);
    setProbabilities(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setPrediction("No images to classify!");
      setProbabilities(null);
      return;
    }
    
    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);

    let intervalId;
    
    try {
      // Simulate gradual progress over 5 seconds
      intervalId = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress < 90) {
            // Slow down progress as it approaches 90%
            const increment = Math.max(2, 10 - Math.floor(prevProgress / 10));
            return Math.min(90, prevProgress + increment);
          }
          return prevProgress;
        });
      }, 500);

      // Keep the 5 second loading time as requested
      const loadingTimeout = new Promise(resolve => setTimeout(resolve, 5000));
      
      const predictionPromise = axios.post("http://127.0.0.1:8080/predict", formData);
      
      const [response] = await Promise.all([predictionPromise, loadingTimeout]);
      const predictionResult = response.data;
      
      setPrediction(predictionResult.prediction);
      setProbabilities(predictionResult.probabilities);
      setProgress(100);
      
      fetchRecommendations(predictionResult.prediction);
      
    } catch (error) {
      console.error("Prediction error:", error);
      setPrediction("Error during classification.");
      setProbabilities(null);
      setProgress(0);
    } finally {
      if (intervalId) clearInterval(intervalId);
      
      // Add a slight delay before removing loading state
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
  };

  const fetchRecommendations = async (condition) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8080/recommendations/${condition}`);
      setRecommendations(response.data);
    } catch (error) {
      console.error("Recommendation error:", error);
      setRecommendations([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-10">
      {/* Match the width and style of HuggingFace UI more closely */}
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header with proper padding */}
        <div className="p-8 pb-4">
          <Header />
        </div>
        
        {/* Main content */}
        <div className="px-8 pb-8">
          {/* Two-column grid for the upload area and prediction display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image upload area */}
            <div className="bg-gray-700 bg-opacity-40 rounded-xl overflow-hidden border border-gray-700">
              <ImageUploader onFileChange={handleFileChange} onUpload={handleUpload} />
            </div>
            
            {/* Prediction display area */}
            <div className="bg-gray-700 bg-opacity-40 rounded-xl overflow-hidden border border-gray-700 p-6 flex flex-col justify-center items-center min-h-64 text-center relative">
              {loading ? (
                <div className="absolute inset-0 bg-gray-800 bg-opacity-90 flex flex-col items-center justify-center p-4">
                  {/* Progress bar styled like HuggingFace */}
                  <div className="relative w-full max-w-xs h-6 bg-gray-700 rounded-full overflow-hidden mb-6">
                    <div
                      className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    >
                      {/* Text showing percentage inside the progress bar */}
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                        {progress}%
                      </span>
                    </div>
                  </div>
                  {/* Spinning icon */}
                  <div className="animate-spin w-10 h-10 mb-3">
                    <ArrowPathIcon className="text-blue-400" />
                  </div>
                  <p className="text-lg font-medium text-white">Processing...</p>
                </div>
              ) : !selectedFile ? (
                <div className="text-gray-400">
                  <p className="text-lg">No images to classify!</p>
                  <p className="text-sm mt-2">Please upload an image.</p>
                </div>
              ) : prediction ? (
                <div>
                  <p className="text-xl font-semibold text-white">{prediction}</p>
                  {probabilities && (
                    <p className="text-sm text-gray-400 mt-2">
                      Confidence: {(probabilities[0] * 100).toFixed(2)}%
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-gray-400">
                  <p className="text-lg">Prediction will appear here</p>
                  <p className="text-sm mt-2">Click Predict to analyze the image</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Predict button - styled more like HuggingFace's button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleUpload}
              className={`py-3 px-10 rounded-lg font-medium text-base focus:outline-none transition-colors ${
                loading || !selectedFile
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
              }`}
              disabled={loading || !selectedFile}
            >
              {loading ? "Processing..." : "Predict"}
            </button>
          </div>
          
          {/* Recommendations accordion - only show when there are recommendations */}
          {recommendations.length > 0 && !loading && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-300 mb-3">Recommended solutions</h3>
              <RecommendationsAccordion condition={prediction} recommendations={recommendations} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;