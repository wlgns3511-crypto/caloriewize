"""
Fetch USDA FoodData Central data and build SQLite database.
Uses search API to get common foods with nutrition data.

Usage: python3 scripts/fetch-usda.py [--key=YOUR_USDA_KEY]
Get free key at: https://fdc.nal.usda.gov/api-key-signup.html
"""

import json
import os
import re
import sqlite3
import subprocess
import sys
import time

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
DB_PATH = os.path.join(DATA_DIR, 'food.db')
API_BASE = 'https://api.nal.usda.gov/fdc/v1'

API_KEY = 'DEMO_KEY'
for arg in sys.argv:
    if arg.startswith('--key='):
        API_KEY = arg.split('=', 1)[1]

# Common food search terms to get comprehensive coverage
FOOD_QUERIES = [
    # Fruits
    "apple", "banana", "orange", "strawberry", "blueberry", "grape", "watermelon",
    "mango", "pineapple", "peach", "pear", "cherry", "lemon", "lime", "avocado",
    "kiwi", "coconut", "papaya", "plum", "raspberry", "blackberry", "cantaloupe",
    "grapefruit", "fig", "pomegranate", "apricot", "guava", "passion fruit",
    # Vegetables
    "broccoli", "spinach", "carrot", "tomato", "potato", "onion", "garlic",
    "cucumber", "lettuce", "celery", "pepper", "corn", "mushroom", "cabbage",
    "cauliflower", "zucchini", "asparagus", "green beans", "peas", "kale",
    "sweet potato", "beet", "radish", "eggplant", "artichoke", "brussels sprouts",
    # Protein
    "chicken breast", "chicken thigh", "chicken wing", "ground beef", "steak",
    "salmon", "tuna", "shrimp", "pork chop", "bacon", "turkey", "lamb",
    "egg", "tofu", "tempeh", "sardine", "cod", "tilapia", "crab", "lobster",
    # Dairy
    "milk", "cheese", "yogurt", "butter", "cream cheese", "cottage cheese",
    "mozzarella", "cheddar cheese", "parmesan", "sour cream", "ice cream",
    "whey protein", "cream", "goat cheese",
    # Grains
    "rice", "bread", "pasta", "oatmeal", "quinoa", "tortilla", "bagel",
    "cereal", "flour", "cornbread", "noodles", "couscous", "barley",
    "whole wheat bread", "white rice", "brown rice", "sourdough",
    # Nuts & Seeds
    "almond", "peanut", "walnut", "cashew", "pistachio", "pecan",
    "sunflower seeds", "chia seeds", "flax seeds", "pumpkin seeds",
    "peanut butter", "almond butter", "macadamia", "hazelnut",
    # Legumes
    "black beans", "chickpeas", "lentils", "kidney beans", "hummus",
    "edamame", "split peas", "navy beans", "pinto beans",
    # Beverages
    "coffee", "tea", "orange juice", "apple juice", "soda", "beer", "wine",
    "coconut water", "almond milk", "oat milk", "soy milk", "smoothie",
    # Snacks & Sweets
    "chocolate", "cookie", "cake", "donut", "popcorn", "chips",
    "granola bar", "trail mix", "pretzel", "cracker", "brownie",
    "candy", "gummy bears", "honey", "maple syrup", "sugar",
    # Meals & Prepared
    "pizza", "hamburger", "hot dog", "french fries", "taco", "burrito",
    "sushi", "fried rice", "mac and cheese", "grilled cheese", "sandwich",
    "soup", "salad", "pancake", "waffle", "muffin", "croissant",
    # Condiments & Oils
    "olive oil", "coconut oil", "ketchup", "mustard", "mayonnaise",
    "soy sauce", "hot sauce", "salsa", "ranch dressing", "vinegar",
    # Superfoods & Health
    "acai", "goji berries", "matcha", "turmeric", "ginger",
    "spirulina", "hemp seeds", "nutritional yeast",
]

NUTRIENT_MAP = {
    1008: 'calories',
    1003: 'protein',
    1004: 'fat',
    1005: 'carbs',
    1079: 'fiber',
    2000: 'sugar',
    1093: 'sodium',
    1253: 'cholesterol',
    1258: 'saturated_fat',
    1092: 'potassium',
    1162: 'vitamin_c',
    1087: 'calcium',
    1089: 'iron',
}


def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[,()\[\]\{\}/\\\'\"]+', '', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')[:80]


def api_get(url):
    raw = subprocess.check_output(['curl', '-s', url], timeout=30)
    return json.loads(raw)


def init_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.executescript('''
        CREATE TABLE foods (
            fdc_id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            category TEXT,
            calories REAL,
            protein REAL,
            fat REAL,
            carbs REAL,
            fiber REAL,
            sugar REAL,
            sodium REAL,
            cholesterol REAL,
            saturated_fat REAL,
            potassium REAL,
            vitamin_c REAL,
            calcium REAL,
            iron REAL,
            serving_size TEXT
        );

        CREATE TABLE categories (
            slug TEXT PRIMARY KEY,
            name TEXT NOT NULL
        );

        CREATE INDEX idx_foods_slug ON foods(slug);
        CREATE INDEX idx_foods_category ON foods(category);
        CREATE INDEX idx_foods_calories ON foods(calories);
    ''')
    conn.commit()
    return conn


def fetch_foods(conn):
    c = conn.cursor()
    slugs_seen = set()
    categories_seen = set()
    total = 0

    for query in FOOD_QUERIES:
        encoded = query.replace(' ', '%20')
        url = (
            f'{API_BASE}/foods/search?query={encoded}'
            f'&dataType=SR%20Legacy,Foundation'
            f'&pageSize=25&api_key={API_KEY}'
        )

        print(f'  "{query}"...', end=' ', flush=True)
        try:
            result = api_get(url)
        except Exception as e:
            print(f'ERROR: {e}')
            time.sleep(2)
            continue

        foods = result.get('foods', [])
        count = 0

        for food in foods:
            fdc_id = food.get('fdcId')
            name = food.get('description', '').strip()
            if not fdc_id or not name:
                continue

            name = name.title()
            slug = slugify(name)
            if not slug or slug in slugs_seen:
                continue
            slugs_seen.add(slug)

            category = food.get('foodCategory', 'Uncategorized')
            cat_slug = slugify(category)

            if cat_slug and cat_slug not in categories_seen:
                categories_seen.add(cat_slug)
                c.execute('INSERT OR IGNORE INTO categories VALUES (?,?)',
                          (cat_slug, category))

            nutrients = {}
            for n in food.get('foodNutrients', []):
                nid = n.get('nutrientId')
                val = n.get('value')
                if nid and val is not None:
                    field = NUTRIENT_MAP.get(nid)
                    if field:
                        try:
                            nutrients[field] = float(val)
                        except (ValueError, TypeError):
                            pass

            if 'calories' not in nutrients:
                continue

            c.execute('''INSERT OR IGNORE INTO foods VALUES
                (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                (fdc_id, name, slug, cat_slug,
                 nutrients.get('calories'),
                 nutrients.get('protein'),
                 nutrients.get('fat'),
                 nutrients.get('carbs'),
                 nutrients.get('fiber'),
                 nutrients.get('sugar'),
                 nutrients.get('sodium'),
                 nutrients.get('cholesterol'),
                 nutrients.get('saturated_fat'),
                 nutrients.get('potassium'),
                 nutrients.get('vitamin_c'),
                 nutrients.get('calcium'),
                 nutrients.get('iron'),
                 'per 100g'))
            count += 1

        total += count
        print(f'{count} new (total: {total})')
        conn.commit()
        time.sleep(0.3)

    return total


def main():
    print('=== USDA Food Data Fetcher ===')
    print(f'API key: {API_KEY[:10]}...')
    print(f'Queries: {len(FOOD_QUERIES)}')

    conn = init_db()

    print('\nFetching foods...')
    total = fetch_foods(conn)

    c = conn.cursor()
    food_count = c.execute('SELECT COUNT(*) FROM foods').fetchone()[0]
    cat_count = c.execute('SELECT COUNT(*) FROM categories').fetchone()[0]

    print(f'\n=== Database Summary ===')
    print(f'  Foods: {food_count}')
    print(f'  Categories: {cat_count}')
    print(f'  DB size: {os.path.getsize(DB_PATH) / 1024:.0f} KB')

    conn.close()
    print('\nDone!')


if __name__ == '__main__':
    main()
