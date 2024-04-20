// src/components/Welcome.tsx
import React from "react";
import "./Welcome.css";

interface WelcomeProps {
  onClose: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onClose }) => {
  return (
    <div className="welcome-modal">
      <div className="welcome-modal-content">
        <h1>Welcome to</h1>
        <h1>the world of music</h1>
        <button className="welcome-button" onClick={onClose}>
          Explore
        </button>
      </div>
    </div>
  );
};

export default Welcome;
