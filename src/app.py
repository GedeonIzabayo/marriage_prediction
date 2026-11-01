from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

# Create FastAPI application
app = FastAPI(
    title="Marriage Prediction API",
    description="API for predicting whether a person is married at age 30",
    version="1.0"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "marriage_model.pkl"

saved_model = joblib.load(MODEL_PATH)
model = saved_model["model"]
scaler = saved_model["scaler"]


class MarriagePredictionInput(BaseModel):
    age: float
    monthly_income_usd: float
    employment_stability_years: float
    education_years: float
    relationship_years: float
    children: float
    family_responsibility: float = 0.0


@app.get("/")
def home():
    return {
        "message": "Marriage Prediction API is running"
    }


@app.post("/predict")
def predict(data: MarriagePredictionInput):
    # Reload model if updated
    saved = joblib.load(MODEL_PATH)
    current_model = saved["model"]
    current_scaler = saved["scaler"]

    # Create input DataFrame with feature names
    person = pd.DataFrame([{
        "age": data.age,
        "monthly_income_usd": data.monthly_income_usd,
        "employment_stability_years": data.employment_stability_years,
        "education_years": data.education_years,
        "relationship_years": data.relationship_years,
        "children": data.children,
        "family_responsibility": data.family_responsibility
    }])

    # Scale input
    person_scaled = current_scaler.transform(person)

    # Make prediction
    prediction = current_model.predict(person_scaled)[0]

    # Get probabilities
    probabilities = current_model.predict_proba(person_scaled)[0]

    if prediction == 1:
        result = "Married at 30"
    else:
        result = "Not married at 30"

    return {
        "prediction": int(prediction),
        "result": result,
        "probability_married": round(float(probabilities[1]), 4),
        "probability_not_married": round(float(probabilities[0]), 4)
    }
