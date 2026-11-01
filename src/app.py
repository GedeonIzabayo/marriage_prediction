from pathlib import Path
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import joblib
import pandas as pd
from typing import Optional

from src.database import (
    init_db,
    create_user,
    authenticate_user,
    log_prediction,
    get_admin_dashboard_stats
)

# Initialize database tables and seed default users
init_db()

# Create FastAPI application
app = FastAPI(
    title="Marriage Prediction API",
    description="API with Authentication and ML Marriage Prediction",
    version="2.0"
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


# Pydantic Schemas
class LoginRequest(BaseModel):
    username_or_email: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class MarriagePredictionInput(BaseModel):
    age: float
    monthly_income_usd: float
    employment_stability_years: float
    education_years: float
    relationship_years: float
    children: float
    family_responsibility: float = 0.0
    username: Optional[str] = "Anonymous"


@app.get("/")
def home():
    return {
        "message": "Marriage Prediction API is running"
    }


# Auth Endpoints
@app.post("/auth/login")
def login(credentials: LoginRequest):
    user = authenticate_user(credentials.username_or_email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password"
        )
    return {
        "success": True,
        "message": f"Welcome back, {user['username']}!",
        "user": user
    }


@app.post("/auth/register")
def register(data: RegisterRequest):
    if len(data.username.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be at least 3 characters long"
        )
    if len(data.password) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 4 characters long"
        )
    if "@" not in data.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address"
        )

    try:
        user = create_user(
            username=data.username,
            email=data.email,
            password=data.password,
            role="user"
        )
        return {
            "success": True,
            "message": "Registration successful! You can now log in.",
            "user": user
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email is already registered."
        )


@app.get("/admin/dashboard")
def admin_dashboard(role: Optional[str] = None):
    # Only allow admin
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    stats = get_admin_dashboard_stats()
    return stats


# Prediction Endpoint
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

    prob_married = round(float(probabilities[1]), 4)
    prob_not_married = round(float(probabilities[0]), 4)

    # Log prediction to database
    try:
        log_prediction(
            username=data.username or "Anonymous",
            data=data.model_dump(),
            prediction=int(prediction),
            result=result,
            prob_married=prob_married,
            prob_not_married=prob_not_married
        )
    except Exception as e:
        print("Prediction logging error:", e)

    return {
        "prediction": int(prediction),
        "result": result,
        "probability_married": prob_married,
        "probability_not_married": prob_not_married
    }
