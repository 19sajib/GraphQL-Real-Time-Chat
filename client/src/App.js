import './App.css';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import { useState } from 'react';

function App() {
  const [loggedIn,setloggedIn] = useState(localStorage.getItem('jwt')?true:false)

  return (
    <>
      {
        loggedIn? <HomePage setloggedIn={setloggedIn} />:<AuthPage setloggedIn={setloggedIn} />
      }
    </>
  );
}

export default App;
