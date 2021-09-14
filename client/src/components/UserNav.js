import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/themeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun } from "@fortawesome/free-solid-svg-icons";
import { faMoon } from "@fortawesome/free-solid-svg-icons";
import "../styles/userNav.css";

const UserNav = () => {
  // Navbar component (User page)

  const { theme, toggleTheme, setUser } = useContext(ThemeContext);
  const lightMode = <FontAwesomeIcon icon={faSun} />;
  const darkMode = <FontAwesomeIcon icon={faMoon} />;

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className={`user-nav ${theme === "light" ? "user-nav-light" : null}`}>
      {/* <span className="logo">delta</span> */}
      <Link className="logo" to="/user">
        alpha
      </Link>
      <div className="user-nav-right">
        <span onClick={toggleTheme}>
          {theme === "light" ? darkMode : lightMode}
        </span>
        <span onClick={logout} id="logout">
          Sign Out
        </span>
      </div>
    </div>
  );
};

export default UserNav;
