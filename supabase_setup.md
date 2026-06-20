# Supabase Setup Guide — FYP Project

> This guide covers full setup from creating a Supabase project through running migrations, seeding data, and verifying the schema.

---

## 1. Supabase Project Creation

### Step 1 — Create account
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **New Project**

### Step 2 — Configure the project
| Field | Value |
|---|---|
| Name | `fyp-db` (or your preferred name) |
| Database Password | Strong password — **save this securely** |
| Region | Choose closest to your users |
| Plan | Free tier is sufficient for development |

4. Click **Create new project** and wait ~2 minutes for provisioning

---

## 2. Get the Database Connection String

1. In your Supabase dashboard → **Project Settings** → **Database**
2. Scroll to **Connection string** → select **URI** tab
3. Select **Session mode** (port 5432) for Alembic migrations
4. Copy the connection string — it looks like:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

> ⚠️ **Transaction mode (port 6543)** uses PgBouncer connection pooling and is NOT compatible with Alembic migrations. Always use port **5432** for migrations.

---

## 3. Configure Local Environment

```bash
# In the FYP project root
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql+psycopg2://postgres:YOUR-PASSWORD@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

> Note the `+psycopg2` driver suffix required by SQLAlchemy.

---

## 4. Install Dependencies

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate      # Linux/Mac
# .venv\Scripts\activate       # Windows

# Install packages
pip install -r requirements.txt
```

---

## 5. Running Migrations

All Alembic commands must be run from the `backend/` directory (where `alembic.ini` lives).

```bash
cd backend

# View current migration state
alembic current

# Run ALL migrations (tables + seed data)
alembic upgrade head
```

This applies the following in order:
| Revision | Description |
|---|---|
| 0001 | Creates all 14 tables + enables pgcrypto |
| 0002 | Seeds 6 countries |
| 0003 | Seeds 5 fields of study |

### Running individual migrations
```bash
# Apply only one step at a time
alembic upgrade +1

# Roll back one step
alembic downgrade -1

# Roll back everything
alembic downgrade base
```

---

## 6. Verifying Schema in Supabase

### Via Supabase Dashboard
1. Go to your project → **Table Editor**
2. You should see all 14 tables listed in the left sidebar:
   - `users`
   - `student_profiles`
   - `countries` (6 rows)
   - `fields_of_study` (5 rows)
   - `universities`
   - `university_programs`
   - `extracurricular_activities`
   - `student_preferences`
   - `admission_predictions`
   - `recommendations`
   - `recommendation_explanations`
   - `saved_universities`
   - `applications`
   - `admin_logs`

### Verify seed data
```sql
-- Run in Supabase SQL Editor
SELECT * FROM countries;
SELECT * FROM fields_of_study;
```

Expected output:

**countries:**
| id | country_name |
|----|---|
| 1 | USA |
| 2 | Canada |
| 3 | UK |
| 4 | Germany |
| 5 | Australia |
| 6 | Ireland |

**fields_of_study:**
| id | field_name |
|----|---|
| 1 | Computer Science |
| 2 | Data Science |
| 3 | Artificial Intelligence |
| 4 | Software Engineering |
| 5 | Cyber Security |

---

## 7. Using retrieve_schema.py

The schema introspection script connects to your live database and generates an up-to-date `generated_schema.md` at the project root.

```bash
# From project root (with .venv activated)
cd backend
python scripts/retrieve_schema.py
```

Expected output:
```
✅  Connected to database.
🔍  Introspecting schema…
✅  Schema written to: /path/to/FYP/generated_schema.md
    Tables discovered: 14
```

The generated `generated_schema.md` will contain:
- All table definitions with column types
- Primary keys
- Indexes
- Foreign keys

> **Tip:** Run this script after every migration to keep your schema documentation in sync.

---

## 8. Troubleshooting

### ❌ Connection refused / timeout

**Symptoms:** `could not connect to server`

**Fixes:**
1. Verify the connection string uses **port 5432** (not 6543)
2. Check your database password is correct in `.env`
3. Ensure the Supabase project is not paused (free tier pauses after 7 days of inactivity)
4. Check Supabase Dashboard → Project → Status

---

### ❌ `alembic.util.exc.CommandError: Can't locate revision...`

**Symptoms:** Alembic complains about missing revision

**Fix:** Ensure all 3 migration files exist in `backend/alembic/versions/`:
```bash
ls backend/alembic/versions/
# Expected:
# 0001_initial_migration.py
# 0002_seed_countries.py
# 0003_seed_fields_of_study.py
```

---

### ❌ `ModuleNotFoundError: No module named 'models'`

**Symptoms:** Running `alembic upgrade head` fails with import error

**Fix:** Run alembic from the `backend/` directory (not project root):
```bash
cd backend
alembic upgrade head
```

---

### ❌ `DATABASE_URL is not set`

**Fix:**
```bash
# Make sure .env exists and is populated
cat .env
# Should show: DATABASE_URL=postgresql+psycopg2://...
```

---

### ❌ `psycopg2.OperationalError: SSL connection required`

**Fix:** Add `?sslmode=require` to your connection string:
```env
DATABASE_URL=postgresql+psycopg2://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres?sslmode=require
```

---

### ❌ Seed data duplicated after re-running migrations

**Explanation:** Alembic tracks which revisions have been applied in the `alembic_version` table. If you run `alembic upgrade head` when already at head, nothing runs again.

**If you need to reseed:**
```bash
alembic downgrade 0001   # Roll back to after initial tables
alembic upgrade head     # Re-apply seed migrations
```

---

## 9. Row Level Security (RLS) — Optional

Supabase enables RLS by default. For development using direct PostgreSQL (psycopg2), RLS does not apply. If you later use Supabase client libraries (JS/Python), you must configure RLS policies.

To disable RLS for development (not recommended for production):
```sql
-- Run in Supabase SQL Editor for each table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- Repeat for all tables as needed
```

---

## 10. Supabase Useful Links

| Resource | URL |
|---|---|
| Dashboard | https://app.supabase.com |
| SQL Editor | Dashboard → SQL Editor |
| Table Editor | Dashboard → Table Editor |
| API Docs | Dashboard → API |
| Connection Pooling | Dashboard → Project Settings → Database |
| PostgreSQL Extensions | Dashboard → Database → Extensions |
