import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import MainScreen from './pages/MainScreen';

function App() {
  return (
    <Router>
      <div className="App">
        {/* <nav>
          <ul>
            <li>
              <Link to="/">MainScreen</Link>
            </li>
            <li>
              <Link to="/simulator">Climate Simulator</Link>
            </li>
          </ul>
        </nav> */}

        <Routes>
          <Route path="/" element={
            <header className="App-header">
              <h1>Welcome to EcoMeter</h1>
              <Link to="/simulator" className="App-link">
                Start Simulation
              </Link>
            </header>
          } />
          <Route path="/simulator" element={<MainScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

