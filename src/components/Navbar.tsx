// src/components/Navbar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css"; //color

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <ul className="nav nav-tabs justify-content-center">
      <li className="nav-item">
        <Link className={`nav-link ${isActive("/") ? "active" : ""}`} to="/">
          Songs
        </Link>
      </li>
      <li className="nav-item">
        <Link
          className={`nav-link ${isActive("/Singers") ? "active" : ""}`}
          to="/Singers"
        >
          Singers
        </Link>
      </li>
      <li className="nav-item">
        <Link
          className={`nav-link ${isActive("/Genres") ? "active" : ""}`}
          to="/Genres"
        >
          Genres
        </Link>
      </li>
      <li className="nav-item">
        <Link
          className={`nav-link ${isActive("/Features") ? "active" : ""}`}
          to="/Features"
        >
          Features
        </Link>
      </li>
    </ul>
  );
};

export default Navbar;
