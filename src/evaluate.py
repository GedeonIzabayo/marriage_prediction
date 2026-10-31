import joblib

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

from preprocess import load_data, prepare_data


MODEL_PATH = "models/marriage_model.pkl"


def evaluate_model():

    # Load dataset
    df = load_data()

    # Prepare test data
    X_train, X_test, y_train, y_test, scaler = prepare_data(df)

    # Load trained model
    saved = joblib.load(MODEL_PATH)

    model = saved["model"]

    # Make predictions
    y_pred = model.predict(X_test)

    # Accuracy
    accuracy = accuracy_score(y_test, y_pred)

    print("\n==============================")
    print("MODEL EVALUATION")
    print("==============================")

    print("\nAccuracy:", accuracy)

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))


if __name__ == "__main__":
    evaluate_model()