import React, { useState } from "react";
import "./AddUser.css";

const AddUser = ({ onAdd }) => {
  const [name, setName] = useState("");

  const handleAdd = async () => {
    if (!name) return;
    await fetch("http://127.0.0.1:8000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    setName("");
    onAdd();
  };

  return (
    <div className="add-user">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New user name" />
      <button onClick={handleAdd}>Add User</button>
    </div>
  );
};

export default AddUser;
