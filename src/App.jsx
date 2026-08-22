import React, { useState } from 'react';
import Login from './pages/Login';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = (username, password) => {
    // Check credentials logic
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="p-8 text-center">
      <h1 className="text-xl font-bold">Welcome to MD Transport Dashboard!</h1>
      <button 
        onClick={() => setIsLoggedIn(false)}
        className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs"
      >
        Sign Out
      </button>
    </div>
  );
}