import React from 'react';

const Dashboard: React.FC = () => {

  return (
    <div>
      <nav className="nav">
        <a href="/admin/dashboard">Dashboard</a>
        <a href="/admin/tasks">Tasks</a>
        <a href="/admin/users">Users</a>
        <a href="/admin/categories">Categories</a>
        <a href="/admin/priorities">Priorities</a>
      </nav>
      <div className="container">
        <h1>Admin Dashboard</h1>
        <p>Bienvenue sur le tableau de bord administrateur !</p>
      </div>
    </div>
  );
};
export default Dashboard;
