"""
retrieve_schema.py
──────────────────
Connects to the Supabase PostgreSQL database and introspects the live schema.
Generates generated_schema.md in the project root.

Usage:
    cd backend
    python scripts/retrieve_schema.py

Requirements:
    - DATABASE_URL set in project root .env
    - pip install sqlalchemy psycopg2-binary python-dotenv
"""

import os
import sys
from pathlib import Path
from datetime import datetime

# ── Path setup ─────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
ROOT_DIR = BACKEND_DIR.parent
OUTPUT_FILE = ROOT_DIR / "generated_schema.md"

# Load .env
from dotenv import load_dotenv
load_dotenv(ROOT_DIR / ".env")

from sqlalchemy import create_engine, text

# ── Database connection ────────────────────────────────────────────────────────

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌  ERROR: DATABASE_URL is not set in .env")
    sys.exit(1)

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("✅  Connected to database.")
except Exception as e:
    print(f"❌  Connection failed: {e}")
    sys.exit(1)


# ── Query helpers ──────────────────────────────────────────────────────────────

def get_tables(conn) -> list[str]:
    """Return all user-defined table names (excluding alembic internals)."""
    result = conn.execute(text("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          AND table_name != 'alembic_version'
        ORDER BY table_name
    """))
    return [row[0] for row in result]


def get_columns(conn, table: str) -> list[dict]:
    result = conn.execute(text("""
        SELECT
            column_name,
            data_type,
            character_maximum_length,
            numeric_precision,
            numeric_scale,
            is_nullable,
            column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = :table
        ORDER BY ordinal_position
    """), {"table": table})
    rows = []
    for r in result:
        col_type = r[1]
        if r[2]:
            col_type += f"({r[2]})"
        elif r[3] and r[4]:
            col_type += f"({r[3]},{r[4]})"
        rows.append({
            "column": r[0],
            "type": col_type,
            "nullable": r[5],
            "default": r[6] or "",
        })
    return rows


def get_primary_keys(conn, table: str) -> list[str]:
    result = conn.execute(text("""
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = :table
        ORDER BY kcu.ordinal_position
    """), {"table": table})
    return [row[0] for row in result]


def get_foreign_keys(conn, table: str) -> list[dict]:
    result = conn.execute(text("""
        SELECT
            kcu.column_name,
            ccu.table_name  AS foreign_table,
            ccu.column_name AS foreign_column,
            rc.delete_rule
        FROM information_schema.referential_constraints rc
        JOIN information_schema.key_column_usage kcu
          ON rc.constraint_name = kcu.constraint_name
         AND kcu.table_schema = 'public'
        JOIN information_schema.constraint_column_usage ccu
          ON rc.unique_constraint_name = ccu.constraint_name
        WHERE kcu.table_name = :table
        ORDER BY kcu.column_name
    """), {"table": table})
    rows = []
    for r in result:
        rows.append({
            "column": r[0],
            "references": f"{r[1]}({r[2]})",
            "on_delete": r[3],
        })
    return rows


def get_indexes(conn, table: str) -> list[dict]:
    result = conn.execute(text("""
        SELECT
            i.relname            AS index_name,
            ix.indisunique       AS is_unique,
            array_agg(a.attname ORDER BY array_position(ix.indkey, a.attnum)) AS columns
        FROM pg_catalog.pg_class c
        JOIN pg_catalog.pg_index ix ON c.oid = ix.indrelid
        JOIN pg_catalog.pg_class i  ON i.oid  = ix.indexrelid
        JOIN pg_catalog.pg_attribute a
          ON a.attrelid = c.oid AND a.attnum = ANY(ix.indkey)
        WHERE c.relname = :table
          AND c.relkind = 'r'
        GROUP BY i.relname, ix.indisunique
        ORDER BY i.relname
    """), {"table": table})
    rows = []
    for r in result:
        rows.append({
            "name": r[0],
            "unique": "YES" if r[1] else "NO",
            "columns": ", ".join(r[2]),
        })
    return rows


def get_constraints(conn, table: str) -> list[dict]:
    result = conn.execute(text("""
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = :table
          AND constraint_type IN ('UNIQUE', 'CHECK', 'PRIMARY KEY')
        ORDER BY constraint_name
    """), {"table": table})
    return [{"name": r[0], "type": r[1]} for r in result]


# ── Markdown generation ────────────────────────────────────────────────────────

def table_md(headers: list[str], rows: list[list]) -> str:
    widths = [len(h) for h in headers]
    for row in rows:
        for i, cell in enumerate(row):
            widths[i] = max(widths[i], len(str(cell)))

    def fmt_row(r):
        return "| " + " | ".join(str(c).ljust(widths[i]) for i, c in enumerate(r)) + " |"

    sep = "| " + " | ".join("-" * w for w in widths) + " |"
    lines = [fmt_row(headers), sep] + [fmt_row(r) for r in rows]
    return "\n".join(lines)


def generate_markdown() -> str:
    lines = []
    lines.append("# Database Schema")
    lines.append(f"\n> Auto-generated by `retrieve_schema.py` on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}\n")

    with engine.connect() as conn:
        tables = get_tables(conn)

        if not tables:
            lines.append("⚠️  No tables found. Run migrations first.")
            return "\n".join(lines)

        lines.append(f"**Total tables:** {len(tables)}\n")
        lines.append("---\n")

        for table in tables:
            lines.append(f"## {table}\n")

            # Columns
            columns = get_columns(conn, table)
            if columns:
                rows = [[c["column"], c["type"], c["nullable"], c["default"]] for c in columns]
                lines.append(table_md(["Column", "Type", "Nullable", "Default"], rows))
            else:
                lines.append("_No columns found._")

            lines.append("")

            # Primary Keys
            pks = get_primary_keys(conn, table)
            lines.append(f"**Primary Key:** {', '.join(pks) if pks else 'None'}\n")

            # Indexes
            indexes = get_indexes(conn, table)
            if indexes:
                lines.append("**Indexes:**\n")
                idx_rows = [[i["name"], i["unique"], i["columns"]] for i in indexes]
                lines.append(table_md(["Index Name", "Unique", "Columns"], idx_rows))
                lines.append("")
            else:
                lines.append("**Indexes:** None\n")

            # Foreign Keys
            fks = get_foreign_keys(conn, table)
            if fks:
                lines.append("**Foreign Keys:**\n")
                fk_rows = [[f["column"], f["references"], f["on_delete"]] for f in fks]
                lines.append(table_md(["Column", "References", "On Delete"], fk_rows))
                lines.append("")
            else:
                lines.append("**Foreign Keys:** None\n")

            # Constraints
            constraints = get_constraints(conn, table)
            if constraints:
                lines.append("**Constraints:**\n")
                c_rows = [[c["name"], c["type"]] for c in constraints]
                lines.append(table_md(["Constraint Name", "Type"], c_rows))
                lines.append("")

            lines.append("---\n")

    return "\n".join(lines)


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("🔍  Introspecting schema…")
    markdown = generate_markdown()

    OUTPUT_FILE.write_text(markdown, encoding="utf-8")
    print(f"✅  Schema written to: {OUTPUT_FILE}")
    print(f"    Tables discovered: {markdown.count('## ')}")
