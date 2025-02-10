from flask import Flask, request, jsonify
import joblib
import numpy as np
from sklearn.svm import SVR
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  

# Load the trained model and scaler (adjust filenames as needed)
MODEL_FILE = 'co2_predictor_model.pkl'
SCALER_FILE = 'scaler.pkl'

# Load model and scaler
try:
    model = joblib.load(MODEL_FILE)
    scaler = joblib.load(SCALER_FILE)
except Exception as e:
    raise RuntimeError(f"Error loading model or scaler: {e}")

@app.route('/')
def index():
    return "CO₂ Prediction API is running."

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        # Handle the OPTIONS request
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response

    try:
        # Get input data from the request
        input_data = request.json

        # Expected keys in the request
        expected_keys = [
            "Air Pollutants (PPM)",
            "Vehicles (Count)",
            "Factories (Count)",
            "Land Use & Biomass (Hectares)",
            "Combustion (PPM)",
            "Trees (Count)"
        ]

        # Ensure all required keys are in the input data
        if not all(key in input_data for key in expected_keys):
            return jsonify({
                "status": "error",
                "error": "Missing required input parameters."
            }), 400

        # Extract and transform data
        features = [input_data[key] for key in expected_keys]

        # Create a NumPy array with the correct feature names
        X = np.array([features], dtype=object)
        X = X.reshape(1, -1)

        # Scale the input data
        scaled_features = scaler.transform(X)

        # Make prediction
        predicted_co2 = model.predict(scaled_features)[0]

        # Respond with the prediction
        return jsonify({
            "status": "success",
            "Predicted CO2 Levels (PPM)": round(predicted_co2, 2)
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)