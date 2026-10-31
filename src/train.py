import os
import joblib

from sklearn.linear_model import LogisticRegression

from preprocess import load_data, prepare_data


MODEL_PATH = "models/marriage_model.pkl"


def train_model():

    # Load dataset
    df = load_data()

    # Prepare data
    X_train, X_test, y_train, y_test, scaler = prepare_data(df)

    # Create Logistic Regression model
    model = LogisticRegression(
        random_state=42,
        max_iter=1000
    )

    # Train model
    model.fit(X_train, y_train)

    # Create models directory
    os.makedirs("models", exist_ok=True)

    # Save model and scaler
    joblib.dump(
        {
            "model": model,
            "scaler": scaler
        },
        MODEL_PATH
    )

    print("\nModel trained successfully.")
    print("Model saved to:", MODEL_PATH)


if __name__ == "__main__":
    train_model()