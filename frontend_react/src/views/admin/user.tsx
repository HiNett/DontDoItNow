import React, { useEffect, useState } from 'react';

const Users: React.FC = () => {

  return (
    <div>
      <nav className="nav">
        <a href="/admin/dashboard">Dashboard</a>
        <a href="/admin/tasks">Tasks</a>
        <a href="/admin/users">Users</a>
        <a href="/admin/categorie">Categories</a>
        <a href="/admin/priorities">Priorities</a>
      </nav>
      <div className="container">
        <h1>Admin Users</h1>
        <p>Bienvenue sur la gestion des utilisateurs !</p>
      </div>
    </div>
  );
};
export default Users;
