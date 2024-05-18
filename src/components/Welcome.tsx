import React from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";

interface WelcomeProps {
  onClose: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    onClose(); // 关闭欢迎页面
    navigate("/"); // 导航到 /songs 页面
  };

  return (
    <div className="welcome-modal">
      <div className="welcome-modal-content">
        <h1>Welcome to</h1>
        <h1>the world of music</h1>
        <button className="welcome-button" onClick={handleExploreClick}>
          Explore
        </button>
      </div>
    </div>
  );
};

export default Welcome;
