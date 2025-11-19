import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './views/login';
import Tasks from './views/tasks';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tasks" element={<Tasks />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
