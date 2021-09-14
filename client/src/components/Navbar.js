import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";

const Navbar = () => {
  // Navbar component (Homepage)

  const [isHovered, setIsHovered] = useState(false);

  const navbarTopSecondClass = isHovered ? "nav-top-hover" : null;
  // const svgStroke = isHovered ? "#888888" : "#bbbbbb";
  let svgClass = isHovered ? "hov-svg" : "reg-svg";

  return (
    <div className="navbar-container">
      <div className={`navbar-top ${navbarTopSecondClass}`}>
        <Link to="/">
          <span id="logo">alpha</span>
        </Link>
        <div
          className="tracker-wrapper"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span>Trackers</span>
          <svg
            className={svgClass}
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            viewBox="0 0 24 24"
            fill="none"
            // stroke={svgStroke}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </div>
        {/* <span>Support</span> */}
      </div>
      {isHovered ? (
        <div
          className="navbar-bottom"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="nav-bottom-links">
            <Link className="link" to="/crypto-intro">
              Crypto
            </Link>
            <Link to="/stock-intro">Stocks</Link>
          </div>
        </div>
      ) : (
        <div className="navbar-bottom navbar-hidden"></div>
      )}
    </div>
  );
};

export default Navbar;
