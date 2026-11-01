import sys
from database import reset_password_cli, authenticate_user, init_db

init_db()

def main():
    print("==============================")
    print("PASSWORD RESET UTILITY")
    print("==============================")

    username = input("Enter username (e.g. admin or user1): ").strip()
    if not username:
        print("Username cannot be empty.")
        return

    new_password = input("Enter new password (min 4 characters): ").strip()
    if len(new_password) < 4:
        print("Password must be at least 4 characters long.")
        return

    confirm = input("Confirm new password: ").strip()
    if new_password != confirm:
        print("Passwords do not match!")
        return

    success = reset_password_cli(username, new_password)
    if success:
        print(f"\nSUCCESS: Password for '{username}' was updated successfully!")
    else:
        print(f"\nERROR: User '{username}' was not found in the database.")


if __name__ == "__main__":
    main()
