import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


DATA_PATH = "data/marriage_prediction_50_rows.csv"


def load_data():
    df = pd.read_csv(DATA_PATH)

    print("Dataset shape:", df.shape)
    print("\nFirst 5 rows:")
    print(df.head())

    return df


def prepare_data(df):
    X = df.drop("married_at_30", axis=1)
    y = df["married_at_30"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    scaler = StandardScaler()

    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    return X_train_scaled, X_test_scaled, y_train, y_test, scaler


if __name__ == "__main__":
    df = load_data()
    prepare_data(df)

    print("\nData preprocessing completed successfully.")