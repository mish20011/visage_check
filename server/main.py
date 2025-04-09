from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from fastai.vision.all import load_learner, PILImage
import os
import pandas as pd
import logging
import pathlib

# Fix for PosixPath on Windows
pathlib.PosixPath = pathlib.WindowsPath

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

MODEL_PATH = r"C:\Users\PC\Desktop\tc3202-3a-9\server\model\export.pkl"

try:
    model = load_learner(MODEL_PATH)
    labels = model.dls.vocab
    logging.info(f"Model loaded successfully from: {MODEL_PATH}")
except FileNotFoundError:
    logging.error(f"Model file not found at: {MODEL_PATH}")
    model = None
except Exception as e:
    logging.error(f"Error loading model: {e}")
    model = None

# ----------------------------------------------------------------------
# COMMENT OUT RECOMMENDATIONS CODE TEMPORARILY
# ----------------------------------------------------------------------
# RECOMMENDATION_PATH = os.path.join(os.path.dirname(__file__), 'data', 'recommendation.xlsx')
# try:
#     df = pd.read_excel(RECOMMENDATION_PATH)
#     logging.info(f"Recommendations loaded successfully from: {RECOMMENDATION_PATH}")
# except FileNotFoundError:
#     logging.error(f"Recommendations file not found at: {RECOMMENDATION_PATH}")
#     df = pd.DataFrame()
# ----------------------------------------------------------------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Flask API is running!"})

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        logging.error("Model not loaded. Prediction unavailable.")
        return jsonify({"error": "Model not loaded"}), 500

    if "file" not in request.files:
        logging.warning("No file uploaded in request")
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    try:
        img = PILImage.create(file)
        pred, pred_idx, probs = model.predict(img)
        response = {
            "prediction": pred,
            "confidence": float(probs[pred_idx]),
            "all_predictions": {labels[i]: float(probs[i]) for i in range(len(labels))}
        }
        logging.info(f"Prediction: {pred}, Confidence: {probs[pred_idx]:.4f}")
        return jsonify(response)
    except Exception as e:
        logging.error(f"Error during prediction: {e}")
        return jsonify({"error": str(e)}), 500

# ----------------------------------------------------------------------
# COMMENT OUT RECOMMENDATIONS ROUTE TEMPORARILY
# ----------------------------------------------------------------------
# @app.route("/recommendations/<skin_condition>", methods=["GET"])
# def get_recommendations(skin_condition):
#     if df.empty:
#         logging.warning("Recommendations data not loaded.")
#         return jsonify({"error": "Recommendations unavailable"}), 500

#     df_filtered = df[df["class"].str.lower() == skin_condition.lower()]

#     if df_filtered.empty:
#         logging.info(f"No recommendations found for: {skin_condition}")
#         return jsonify({"error": "No recommendations found"}), 404

#     recommendations = []
#     for _, row in df_filtered.iterrows():
#         recommendations.append({
#             "product_name": row["product_name"],
#             "product_link": row["profit_link"],
#             "product_image": row["product_image"]
#         })
#     logging.info(f"Returning {len(recommendations)} recommendations for: {skin_condition}")
#     return jsonify(recommendations)
# ----------------------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True, port=8080)
