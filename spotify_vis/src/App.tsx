import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Welcome from "./components/Welcome";
import Navbar from "./components/Navbar";
import Songs from "./components/Songs";
import Singers from "./components/Singers";
import Genres from "./components/Genres";
import Features from "./components/Features";

const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true); // 控制欢迎界面弹窗的显示

  const handleClose = () => {
    setShowWelcome(false); // 关闭弹窗
  };

  return (
    <Router>
      <div>
        <Navbar />
        {showWelcome && <Welcome onClose={handleClose} />}{" "}
        {/* 只有当 showWelcome 为 true 时显示 Welcome 组件 */}
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
