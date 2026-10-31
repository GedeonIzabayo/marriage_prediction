import joblib
import numpy as np


MODEL_PATH = "models/marriage_model.pkl"


def predict_marriage():

    # Load model
    saved = joblib.load(MODEL_PATH)

    model = saved["model"]
    scaler = saved["scaler"]

    print("==============================")
    print("MARRIAGE PREDICTION")
    print("==============================")

    age = float(input("Age: "))
    income = float(input("Monthly income (USD): "))
    employment = float(
        input("Employment stability (years): ")
    )
    education = float(
        input("Education (years): ")
    )
    relationship = float(
        input("Relationship duration (years): ")
    )
    children = float(
        input("Number of children: ")
    )

    # Create input array
    person = np.array([[
        age,
        income,
        employment,
        education,
        relationship,
        children
    ]])

    # Scale input
    person_scaled = scaler.transform(person)

    # Prediction
    prediction = model.predict(person_scaled)[0]

    # Probability
    probability = model.predict_proba(person_scaled)[0]

    print("\n==============================")

    if prediction == 1:
        print("Prediction: MARRIED at 30")
    else:
        print("Prediction: NOT MARRIED at 30")

    print(
        f"Probability of married: "
        f"{probability[1] * 100:.2f}%"
    )

    print(
        f"Probability of not married: "
        f"{probability[0] * 100:.2f}%"
    )


if __name__ == "__main__":
    predict_marriage()