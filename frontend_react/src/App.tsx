import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./views/login";
import Tasks from "./views/tasks";
import AdminDashboard from "./views/admin/dashboard";
import AdminTasks from "./views/admin/tasks";
import "./app.css";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div id="app-root" className="layout">
        <main className="layout-container">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/admin/tasks" element={<AdminTasks />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;