import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Welcome from "./components/Welcome";
import Navbar from "./components/Navbar";
import Songs from "./components/Songs";
import Singers from "./components/Singers";
import Genres from "./components/Genres";
import Features from "./components/Features";
import "./App.css";

const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleClose = () => {
    setShowWelcome(false);
  };

  return (
    <Router>
      <div>
        <Navbar />
        {showWelcome && <Welcome onClose={handleClose} />} {}
        <div className="tab-content" id="myTabContent">
          <Routes>
            <Route path="/" element={<Songs />} />
            <Route path="/Singers" element={<Singers />} />
            <Route path="/Genres" element={<Genres />} />
            <Route path="/Features" element={<Features />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
