import React, { useEffect, useState } from 'react';
import Login from './views/login';


const App: React.FC = () => {
  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Accueil</h1>
        <Login />
    </div>
  );
};

export default App;
