#!/usr/bin/env python3
"""Generate all pairwise food comparisons"""
import sqlite3, os, time

DB_PATH = os.path.join(os.path.dirname(__file__), "../data/food.db")

def main():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS comparisons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slugA TEXT NOT NULL, slugB TEXT NOT NULL,
            foodA TEXT NOT NULL, foodB TEXT NOT NULL,
            popularity_score REAL DEFAULT 0,
            UNIQUE(slugA, slugB)
        )
    """)
    # Get top 500 foods
    foods = conn.execute("SELECT slug, name FROM foods ORDER BY slug LIMIT 500").fetchall()
    print(f"Top foods: {len(foods)}")
    t0 = time.time()
    batch = []
    count = 0
    for i in range(len(foods)):
        for j in range(i + 1, len(foods)):
            slugA, foodA = foods[i]
            slugB, foodB = foods[j]
            batch.append((slugA, slugB, foodA, foodB, len(foodA) + len(foodB)))
            count += 1
            if len(batch) >= 5000:
                conn.executemany("INSERT OR IGNORE INTO comparisons (slugA, slugB, foodA, foodB, popularity_score) VALUES (?,?,?,?,?)", batch)
                conn.commit()
                print(f"  Inserted {count} pairs...")
                batch = []
    if batch:
        conn.executemany("INSERT OR IGNORE INTO comparisons (slugA, slugB, foodA, foodB, popularity_score) VALUES (?,?,?,?,?)", batch)
        conn.commit()
    final = conn.execute("SELECT COUNT(*) FROM comparisons").fetchone()[0]
    print(f"\nDone! {final} comparisons in {time.time()-t0:.1f}s")
    conn.close()

if __name__ == "__main__":
    main()
