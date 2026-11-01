# Marriage Prediction Machine Learning Project

## 📌 Project Overview

This project uses **Machine Learning** to predict whether a person is likely to be married at the age of 30 based on six input features.

The project is designed as a practical machine learning classification project using **Python, Pandas, Scikit-learn, and Logistic Regression**.

> **Important:** The dataset used in this project is synthetic and is intended for educational and machine learning practice purposes. The model should not be used to make real-life decisions about whether an individual will marry.

---

## 🎯 Project Objective

The main objective is to build a machine learning model that predicts:

* `1` → Married at age 30
* `0` → Not married at age 30

The model learns relationships between six features and the target variable.

---

## 📊 Dataset

The dataset contains **50 rows** and **7 columns**:

### Features

| Feature                      | Description                             |
| ---------------------------- | --------------------------------------- |
| `age`                        | Age of the person                       |
| `monthly_income_usd`         | Approximate monthly income in USD       |
| `employment_stability_years` | Number of years of employment stability |
| `education_years`            | Number of years of formal education     |
| `relationship_years`         | Number of years in a relationship       |
| `children`                   | Number of children                      |

### Target

| Target              | Meaning               |
| ------------------- | --------------------- |
| `married_at_30 = 1` | Married at age 30     |
| `married_at_30 = 0` | Not married at age 30 |

---

## 🤖 Machine Learning Algorithm

The project uses **Logistic Regression**.

Logistic Regression is appropriate because this is a **binary classification problem**.

The model estimates the probability that an observation belongs to one of two classes:

```text
0 → Not married
1 → Married
```

The model can also provide probabilities for both classes.

For example:

```text
Probability of married: 82.50%
Probability of not married: 17.50%
```

---

## 🛠️ Technologies Used

* Python
* Pandas
* NumPy
* Scikit-learn
* Joblib
* Matplotlib
* Seaborn

---

## 📁 Project Structure

```text
MARRIAGE_PREDICTION/
│
├── data/
│   └── marriage_prediction_50_rows.csv
│
├── models/
│   └── marriage_model.pkl
│
├── src/
│   ├── __init__.py
│   ├── preprocess.py
│   ├── train.py
│   ├── evaluate.py
│   └── predict.py
│
├── requirements.txt
├── README.md
└── .gitignore
```

---

## ⚙️ Installation

### 1. Clone the project

If the project is hosted on GitHub:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Move into the project:

```bash
cd MARRIAGE_PREDICTION
```

---

### 2. Create a virtual environment

Windows:

```bash
python -m venv .venv
```

Activate it:

```bash
.venv\Scripts\activate
```

If you are using Git Bash:

```bash
source .venv/Scripts/activate
```

---

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

## 🚀 Running the Project

### Step 1: Train the model

Run:

```bash
python src/train.py
```

The program will:

1. Load the dataset.
2. Separate features and target.
3. Split the dataset into training and testing data.
4. Standardize the features.
5. Create a Logistic Regression model.
6. Train the model.
7. Save the trained model.

The trained model will be saved as:

```text
models/marriage_model.pkl
```

---

### Step 2: Evaluate the model

Run:

```bash
python src/evaluate.py
```

The evaluation provides:

* Accuracy
* Precision
* Recall
* F1-score
* Confusion matrix

Example:

```text
MODEL EVALUATION

Accuracy: 0.80

Classification Report:

              precision    recall    f1-score

0                 0.75      0.80       0.77
1                 0.83      0.80       0.81
```

> The actual results may be different because the dataset is small.

---

### Step 3: Make a prediction

Run:

```bash
python src/predict.py
```

The program asks for information about a person.

Example:

```text
==============================
MARRIAGE PREDICTION
==============================

Age: 29
Monthly income (USD): 900
Employment stability (years): 6
Education (years): 16
Relationship duration (years): 7
Number of children: 2
Family responsibility (1=Yes, 0=No): 0
```

The model then produces a prediction such as:

```text
Prediction: MARRIED at 30

Probability of married: 84.32%
Probability of not married: 15.68%
```

---

## 🔄 Machine Learning Workflow

The project follows this workflow:

```text
                DATASET
                   │
                   ▼
             Data Loading
                   │
                   ▼
          Data Preprocessing
                   │
                   ▼
        Train/Test Split
                   │
                   ▼
          Feature Scaling
          (StandardScaler)
                   │
                   ▼
        Logistic Regression
                   │
                   ▼
              Training
                   │
                   ▼
             Evaluation
                   │
                   ▼
          Saved ML Model
                   │
                   ▼
        New User Information
                   │
                   ▼
             Prediction
```

---

## 🧮 Features and Target

The input matrix `X` contains seven features:

```python
X = df.drop("married_at_30", axis=1)
```

The target variable `y` is:

```python
y = df["married_at_30"]
```

Therefore:

```text
X → 7 input features:
    1. Age
    2. Monthly income (USD)
    3. Employment stability (years)
    4. Education (years)
    5. Relationship duration (years)
    6. Number of children
    7. Family responsibility (caring for siblings / paying school fees)
y → marriage prediction
```

---

## 📏 Feature Scaling

Before training Logistic Regression, the numerical features are standardized using `StandardScaler`.

```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()

X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
```

Scaling helps ensure that features with different numerical ranges do not disproportionately influence the model.

For example:

```text
monthly_income_usd       → hundreds/thousands
education_years          → around 10–20
children                 → 0–3
relationship_years       → 0–10
```

---

## 📈 Model Evaluation

The model is evaluated using several classification metrics.

### Accuracy

Measures the proportion of correct predictions:

```text
Accuracy =
Correct Predictions / Total Predictions
```

### Precision

Measures how many predicted positive cases were actually positive.

### Recall

Measures how many actual positive cases were correctly identified.

### F1-score

Combines precision and recall into a single metric.

### Confusion Matrix

Shows:

```text
                  Predicted
                0          1

Actual  0      TN         FP

        1      FN         TP
```

Where:

* `TN` = True Negative
* `FP` = False Positive
* `FN` = False Negative
* `TP` = True Positive

---

## 🔮 Prediction Example

Suppose a new person provides:

```text
Age = 29
Monthly income = 900
Employment stability = 6 years
Education = 16 years
Relationship = 7 years
Children = 2
```

The model converts these values into a numerical feature vector:

```text
[29, 900, 6, 16, 7, 2]
```

After scaling, the Logistic Regression model calculates the probability of each class.

The final result could be:

```text
Married: 84.32%
Not married: 15.68%
```

The class with the higher predicted probability becomes the model's prediction.

---

## ⚠️ Limitations

This project has several important limitations.

### 1. Small Dataset

The dataset contains only **50 observations**.

A real machine learning project would normally require substantially more representative data.

### 2. Synthetic Data

The dataset was artificially generated for educational purposes and does not represent actual population statistics.

### 3. Prediction Uncertainty

Marriage is influenced by many social, economic, cultural, personal, and individual factors that cannot be completely represented by six numerical variables.

### 4. Potential Bias

A model trained on biased or unrepresentative data can produce biased predictions.

### 5. Not for Real-Life Decisions

This model should **not** be used to judge, rank, or make important decisions about individuals based on their likelihood of marriage.

---

## 🔐 Ethical Considerations

Predicting sensitive personal outcomes requires careful consideration.

This project is intended to demonstrate:

* Data preprocessing
* Classification
* Feature scaling
* Model training
* Model evaluation
* Prediction
* Model serialization

It should be treated as an **educational machine learning exercise**, not as a reliable tool for predicting an individual's personal future.

---

## 🔮 Future Improvements

The project could be improved by:

1. Collecting a much larger dataset.
2. Using real, ethically collected and anonymized data.
3. Performing exploratory data analysis.
4. Handling missing values.
5. Testing multiple algorithms.
6. Using cross-validation.
7. Performing hyperparameter tuning.
8. Comparing Logistic Regression with Random Forest and other classifiers.
9. Creating a web interface using Flask or FastAPI.
10. Creating a React frontend.
11. Deploying the trained model as an API.
12. Monitoring model performance after deployment.

---

## 📚 Possible Algorithms for Comparison

After building the Logistic Regression baseline, other classification algorithms could be tested:

```text
Logistic Regression
       ↓
Decision Tree
       ↓
Random Forest
       ↓
Support Vector Machine
       ↓
K-Nearest Neighbors
       ↓
Gradient Boosting
```

Their performance can then be compared using:

```text
Accuracy
Precision
Recall
F1-score
ROC-AUC
```

---



Machine Learning / Data Science Project

---

## 📄 License

This project is intended for educational and learning purposes.
