import React, { useState } from "react";
import "./MarkRead.css";

const MarkRead = ({ userId, books, onMark }) => {
  const [bookId, setBookId] = useState("");
  const [rating, setRating] = useState("");

  const handleMark = async () => {
    if (!bookId || !rating) return;
    await fetch("http://127.0.0.1:8000/user_books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, book_id: parseInt(bookId), rating: parseInt(rating) })
    });
    setBookId(""); setRating("");
    onMark();
  };

  return (
    <div className="mark-read">
      <label>Mark Book as Read: </label>
      <select value={bookId} onChange={(e) => setBookId(e.target.value)}>
        <option value="">--Choose Book--</option>
        {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
      </select>
      <select value={rating} onChange={(e) => setRating(e.target.value)}>
        <option value="">Rate</option>
        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}★</option>)}
      </select>
      <button onClick={handleMark}>Mark as Read</button>
    </div>
  );
};

export default MarkRead;
