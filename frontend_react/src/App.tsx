import React, { useEffect, useState } from 'react';
import Login from './views/login';


const App: React.FC = () => {
  return (
    <div style={{ margin: '50px', marginTop:'0px', fontFamily: 'sans-serif' }}>
      <h1>Accueil</h1>
        <Login />
    </div>
  );
};

export default App;
