import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./views/login";
import Tasks from "./views/tasks";
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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;