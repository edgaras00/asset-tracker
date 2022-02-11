import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";
import useWindowWidth from "./useWindowWidth";

const Navbar = () => {
  // Navbar component (Homepage)

  const [isHovered, setIsHovered] = useState(false);
  const { width } = useWindowWidth();

  const navbarTopSecondClass = isHovered ? "nav-top-hover" : null;
  let svgClass = isHovered ? "hov-svg" : "reg-svg";

  return width >= 1000 ? (
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
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </div>
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
  ) : (
    <div className="navbar-container">
      <div className="navbar-top">
        <Link to="/">
          <span id="logo">alpha</span>
        </Link>
        <div className="tracker-links">
          <Link className="link" to="/crypto-intro">
            Crypto
          </Link>
          <Link to="/stock-intro">Stocks</Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
