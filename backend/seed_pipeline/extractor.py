import csv
from typing import Iterator, Dict, Any

def extract_csv(filepath: str) -> Iterator[Dict[str, str]]:
    """
    Streaming CSV generator that yields one row at a time.
    Never loads complete CSV into memory.
    """
    with open(filepath, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            yield row
