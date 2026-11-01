import sqlite3
import hashlib
import os
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "data" / "users.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def hash_password(password: str, salt: str = "marriage_predict_salt_2026") -> str:
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()


def init_db():
    os.makedirs(DB_PATH.parent, exist_ok=True)
    conn = get_db()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Prediction history table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            age REAL,
            monthly_income_usd REAL,
            employment_stability_years REAL,
            education_years REAL,
            relationship_years REAL,
            children REAL,
            family_responsibility REAL,
            prediction INTEGER,
            result TEXT,
            probability_married REAL,
            probability_not_married REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Seed default Admin if not exists
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    if not cursor.fetchone():
        admin_pass = hash_password("admin123")
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        """, ("admin", "admin@marriage.com", admin_pass, "admin"))

    # Seed demo regular user if not exists
    cursor.execute("SELECT id FROM users WHERE username = 'user1'")
    if not cursor.fetchone():
        user_pass = hash_password("user123")
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        """, ("user1", "user1@marriage.com", user_pass, "user"))

    conn.commit()
    conn.close()


def create_user(username: str, email: str, password: str, role: str = "user"):
    conn = get_db()
    cursor = conn.cursor()
    pwd_hash = hash_password(password)
    try:
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        """, (username.strip(), email.strip().lower(), pwd_hash, role))
        conn.commit()
        user_id = cursor.lastrowid
        return {"id": user_id, "username": username, "email": email, "role": role}
    finally:
        conn.close()


def authenticate_user(username_or_email: str, password: str):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, username, email, password_hash, role
            FROM users
            WHERE username = ? OR email = ?
        """, (username_or_email.strip(), username_or_email.strip().lower()))
        user = cursor.fetchone()
        if not user:
            return None
        
        expected_hash = hash_password(password)
        if user["password_hash"] == expected_hash:
            return {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "role": user["role"]
            }
        return None
    finally:
        conn.close()


def log_prediction(username: str, data: dict, prediction: int, result: str, prob_married: float, prob_not_married: float):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO predictions (
                username, age, monthly_income_usd, employment_stability_years,
                education_years, relationship_years, children, family_responsibility,
                prediction, result, probability_married, probability_not_married
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            username or "Anonymous",
            data.get("age"),
            data.get("monthly_income_usd"),
            data.get("employment_stability_years"),
            data.get("education_years"),
            data.get("relationship_years"),
            data.get("children"),
            data.get("family_responsibility"),
            prediction,
            result,
            prob_married,
            prob_not_married
        ))
        conn.commit()
    finally:
        conn.close()


def get_admin_dashboard_stats():
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) AS total_users FROM users")
        total_users = cursor.fetchone()["total_users"]

        cursor.execute("SELECT id, username, email, role, created_at FROM users ORDER BY id DESC")
        users_list = [dict(row) for row in cursor.fetchall()]

        cursor.execute("SELECT COUNT(*) AS total_predictions FROM predictions")
        total_predictions = cursor.fetchone()["total_predictions"]

        cursor.execute("SELECT COUNT(*) AS married_count FROM predictions WHERE prediction = 1")
        married_count = cursor.fetchone()["married_count"]

        not_married_count = total_predictions - married_count

        cursor.execute("""
            SELECT id, username, age, monthly_income_usd, employment_stability_years,
                   education_years, relationship_years, children, family_responsibility,
                   prediction, result, probability_married, probability_not_married, created_at
            FROM predictions
            ORDER BY id DESC
            LIMIT 50
        """)
        recent_predictions = [dict(row) for row in cursor.fetchall()]

        return {
            "total_users": total_users,
            "total_predictions": total_predictions,
            "married_count": married_count,
            "not_married_count": not_married_count,
            "users": users_list,
            "recent_predictions": recent_predictions
        }
    finally:
        conn.close()


def change_password(username: str, old_password: str, new_password: str):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, password_hash FROM users WHERE username = ?", (username.strip(),))
        user = cursor.fetchone()
        if not user:
            return False, "User not found."

        if user["password_hash"] != hash_password(old_password):
            return False, "Current password is incorrect."

        new_hash = hash_password(new_password)
        cursor.execute("UPDATE users SET password_hash = ? WHERE username = ?", (new_hash, username.strip()))
        conn.commit()
        return True, "Password changed successfully!"
    finally:
        conn.close()


def reset_password_cli(username: str, new_password: str):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE username = ?", (username.strip(),))
        user = cursor.fetchone()
        if not user:
            return False
        new_hash = hash_password(new_password)
        cursor.execute("UPDATE users SET password_hash = ? WHERE username = ?", (new_hash, username.strip()))
        conn.commit()
        return True
    finally:
        conn.close()


