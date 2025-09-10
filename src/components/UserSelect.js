import React from "react";
import "./UserSelect.css";

const UserSelect = ({ users, selectedUser, onChange }) => (
  <div className="user-select">
    <label>Select User: </label>
    <select value={selectedUser} onChange={(e) => onChange(e.target.value)}>
      <option value="">--Choose User--</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>{user.name}</option>
      ))}
    </select>
  </div>
);

export default UserSelect;
