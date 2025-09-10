import React, { useState } from "react";
import "./AddBook.css";

const AddBook = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [cover, setCover] = useState("");

  const handleAdd = async () => {
    if (!title || !author || !genre) return;
    await fetch("http://127.0.0.1:8000/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author, genre, cover_url: cover })
    });
    setTitle(""); setAuthor(""); setGenre(""); setCover("");
    onAdd();
  };

  return (
    <div className="add-book">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book Title" />
      <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" />
      <input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Genre" />
      <input value={cover} onChange={(e) => setCover(e.target.value)} placeholder="Cover URL" />
      <button onClick={handleAdd}>Add Book</button>
    </div>
  );
};

export default AddBook;
