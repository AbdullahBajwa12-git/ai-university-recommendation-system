"""Standalone, idempotent admin bootstrap script.

Creates a single admin user if one with the given email does not already exist.
Re-running is safe: an existing user with the same email is left untouched.

Credentials are read from environment variables:
    ADMIN_EMAIL     (required)
    ADMIN_PASSWORD  (required)
    ADMIN_NAME      (optional, default: Administrator)

Usage (from the backend/ directory):
    python create_admin.py
"""
import asyncio
import os

import models
import auth
from database import init_db


async def main():
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    full_name = os.getenv("ADMIN_NAME", "Administrator")

    missing = [name for value, name in [(email, "ADMIN_EMAIL"), (password, "ADMIN_PASSWORD")] if not value]
    if missing:
        print(f"Error: required environment variable(s) not set: {', '.join(missing)}")
        raise SystemExit(1)

    await init_db(models.ALL_MODELS)

    existing = await models.User.find_one(models.User.email == email)
    if existing:
        print(f"Admin already exists: {email} (role={existing.role}) — no changes made.")
        return

    admin = models.User(
        email=email,
        full_name=full_name,
        password_hash=auth.get_password_hash(password),
        role="admin",
    )
    await admin.insert()
    print(f"Admin created: {email}")


if __name__ == "__main__":
    asyncio.run(main())
