import React from 'react';

function PredictionDisplay({ prediction, probabilities }) {
  return (
    <div className="bg-gray-700 rounded-lg shadow-md p-6">
      {/* Dark background */}
      <h2 className="text-xl font-semibold text-blue-400 mb-2">
        {/* Blue heading */}
        Prediction
      </h2>
      <p className="text-2xl font-bold text-white">
        {/* White prediction */}
        {prediction}
      </p>
      {probabilities && (
        <p className="mt-2 text-gray-400">
          {/* Lighter confidence */}
          Confidence: {(probabilities[0] * 100).toFixed(2)}%
        </p>
      )}
    </div>
  );
}

export default PredictionDisplay;