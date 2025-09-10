import mysql.connector
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from collections import Counter

app = FastAPI()

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- Database connection --------------------
def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Krishna@1",
        database="bookdb"
    )

# -------------------- Data models --------------------
class User(BaseModel):
    name: str

class Book(BaseModel):
    title: str
    author: str
    genre: str

class UserBook(BaseModel):
    user_id: int
    book_id: int
    rating: Optional[int] = None

# -------------------- CRUD Endpoints --------------------
# Get all users
@app.get("/users")
def get_users():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data

# Add a new user
@app.post("/users")
def add_user(user: User):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (name) VALUES (%s)", (user.name,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "User added successfully"}

# Get all books
@app.get("/books")
def get_books():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM books")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data

# Add a new book
@app.post("/books")
def add_book(book: Book):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO books (title, author, genre) VALUES (%s,%s,%s)",
                   (book.title, book.author, book.genre))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Book added successfully"}

# Mark a book as read
@app.post("/user_books")
def add_user_book(ub: UserBook):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO user_books (user_id, book_id, rating) VALUES (%s,%s,%s)",
                   (ub.user_id, ub.book_id, ub.rating))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Book marked as read"}

# -------------------- Recommendation Endpoint --------------------
@app.get("/recommendations/{user_id}")
def get_recommendations(user_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # 1️⃣ Books user has read
    cursor.execute("SELECT book_id, rating FROM user_books WHERE user_id=%s", (user_id,))
    user_read = cursor.fetchall()
    read_ids = [r['book_id'] for r in user_read]

    # 2️⃣ Favorite genre
    favorite_genre = None
    if read_ids:
        placeholders = ','.join(['%s'] * len(read_ids))
        cursor.execute(f"SELECT genre FROM books WHERE id IN ({placeholders})", tuple(read_ids))
        genres = [row['genre'] for row in cursor.fetchall()]
        favorite_genre = Counter(genres).most_common(1)[0][0]

    # 3️⃣ Collaborative filtering: books read by similar users
    collab_books = []
    if read_ids:
        placeholders = ','.join(['%s'] * len(read_ids))
        cursor.execute(f"""
            SELECT DISTINCT b.id, b.title, b.author, b.genre, b.cover_url, ub2.rating
            FROM user_books ub1
            JOIN user_books ub2 ON ub1.book_id = ub2.book_id
            JOIN books b ON ub2.book_id = b.id
            WHERE ub1.user_id = %s AND ub2.user_id != %s
            AND ub2.book_id NOT IN ({placeholders})
        """, (user_id, user_id, *read_ids))
        collab_books = cursor.fetchall()

    # 4️⃣ Recommend unread books in favorite genre
    query = "SELECT b.id, b.title, b.author, b.genre, b.cover_url, ub.rating " \
            "FROM books b LEFT JOIN user_books ub ON b.id = ub.book_id AND ub.user_id=%s WHERE 1=1"
    params = (user_id,)

    if read_ids:
        placeholders = ','.join(['%s'] * len(read_ids))
        query += f" AND b.id NOT IN ({placeholders})"
        params += tuple(read_ids)

    if favorite_genre:
        query += " AND b.genre=%s"
        params += (favorite_genre,)

    cursor.execute(query, params)
    genre_books = cursor.fetchall()

    # Merge and remove duplicates
    all_recommendations = {b['id']: b for b in genre_books + collab_books}
    recommendations = list(all_recommendations.values())

    cursor.close()
    conn.close()
    return recommendations 