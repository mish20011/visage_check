from flask import Flask, request, jsonify
from flask_cors import CORS
from fastai.vision.all import load_learner, PILImage
import os
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# ✅ Set the correct model path
MODEL_PATH = r"C:\Users\PC\Desktop\visage-check\client\model\export.pkl"  # Direct absolute path
model = load_learner(MODEL_PATH)
labels = model.dls.vocab

# Load the recommendations
RECOMMENDATION_PATH = r"C:\Users\PC\Desktop\visage-check\client\model\recommendation.xlsx"
df = pd.read_excel(RECOMMENDATION_PATH)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Flask API is running!"})

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    img = PILImage.create(file)

    # Get prediction
    pred, pred_idx, probs = model.predict(img)

    response = {
        "prediction": pred,
        "confidence": float(probs[pred_idx]),
        "all_predictions": {labels[i]: float(probs[i]) for i in range(len(labels))}
    }

    return jsonify(response)

@app.route("/recommendations/<skin_condition>", methods=["GET"])
def get_recommendations(skin_condition):
    df_filtered = df[df["class"].str.lower() == skin_condition.lower()]
    
    if df_filtered.empty:
        return jsonify({"error": "No recommendations found"}), 404

    recommendations = []
    for _, row in df_filtered.iterrows():
        recommendations.append({
            "product_name": row["product_name"],
            "product_link": row["profit_link"],
            "product_image": row["product_image"]
        })

    return jsonify(recommendations)

if __name__ == "__main__":
    app.run(debug=True, port=8080)
