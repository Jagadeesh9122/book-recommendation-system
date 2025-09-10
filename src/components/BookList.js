import React from "react";
import "./BookList.css";

const BookList = ({ title, books }) => (
  <div className="book-list">
    <h3>{title}</h3>
    <div className="book-cards">
      {books.map((book) => (
        <div className="book-card" key={book.id}>
          {book.cover_url && <img src={book.cover_url} alt={book.title} />}
          <div className="book-info">
            <h4>{book.title}</h4>
            <p>{book.author}</p>
            <p>{book.genre}</p>
            {book.rating && (
              <div className="stars">
                {"★".repeat(book.rating) + "☆".repeat(5 - book.rating)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default BookList;
