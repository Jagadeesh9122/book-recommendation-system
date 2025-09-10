import React, { useState, useEffect } from "react";
import UserSelect from "./components/UserSelect";
import BookList from "./components/BookList";
import AddUser from "./components/AddUser";
import AddBook from "./components/AddBook";
import MarkRead from "./components/MarkRead";
import "./App.css";

const backendURL = "http://127.0.0.1:8000";

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [allBooks, setAllBooks] = useState([]);
  const [readBooks, setReadBooks] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [activeTab, setActiveTab] = useState("read");
  const [favoriteGenre, setFavoriteGenre] = useState("");

  const fetchUsers = () => fetch(`${backendURL}/users`).then(res => res.json()).then(setUsers);
  const fetchBooks = () => fetch(`${backendURL}/books`).then(res => res.json()).then(setAllBooks);

  useEffect(() => { fetchUsers(); fetchBooks(); }, []);

  useEffect(() => {
    if (!selectedUser) {
      setReadBooks([]); setRecommendedBooks([]); setFavoriteGenre(""); return;
    }

    fetch(`${backendURL}/books`)
      .then(res => res.json())
      .then(all => {
        fetch(`${backendURL}/recommendations/${selectedUser}`)
          .then(res => res.json())
          .then(recommended => {
            setRecommendedBooks(recommended);

            const read = all.filter(b => !recommended.some(r => r.id === b.id));
            setReadBooks(read);

            const genreCount = {};
            read.forEach(b => { genreCount[b.genre] = (genreCount[b.genre] || 0) + 1; });
            recommended.forEach(b => { genreCount[b.genre] = (genreCount[b.genre] || 0) + 1; });
            const sorted = Object.entries(genreCount).sort((a,b)=>b[1]-a[1]);
            setFavoriteGenre(sorted[0]?.[0] || "");
          });
      });
  }, [selectedUser]);

  return (
    <div className="app-container">
      <h1>📚 Personalized Book Recommendations</h1>

      <UserSelect users={users} selectedUser={selectedUser} onChange={setSelectedUser} />
      <AddUser onAdd={fetchUsers} />
      <AddBook onAdd={fetchBooks} />
      {selectedUser && <MarkRead userId={selectedUser} books={allBooks} onMark={() => { fetchBooks(); setSelectedUser(selectedUser); }} />}

      {selectedUser && favoriteGenre && (
        <div className="favorite-genre">
          Favorite Genre: <strong>{favoriteGenre}</strong>
        </div>
      )}

      <div className="tabs">
        <button className={activeTab==="read"?"active":""} onClick={()=>setActiveTab("read")}>Read Books</button>
        <button className={activeTab==="recommended"?"active":""} onClick={()=>setActiveTab("recommended")}>Recommended Books</button>
      </div>

      {activeTab === "read" && <BookList title="Books Read" books={readBooks} />}
      {activeTab === "recommended" && <BookList title="Recommended Books" books={recommendedBooks} />}
    </div>
  );
}

export default App;
