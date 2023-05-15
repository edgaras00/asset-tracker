import { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/appContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun } from "@fortawesome/free-solid-svg-icons";
import { faMoon } from "@fortawesome/free-solid-svg-icons";

import "./styles/userNav.css";

const UserNav = () => {
  // Navbar component (User page)

  const { theme, toggleTheme, setUser } = useContext(AppContext);
  const lightMode = <FontAwesomeIcon icon={faSun} />;
  const darkMode = <FontAwesomeIcon icon={faMoon} />;

  const logout = async () => {
    try {
      localStorage.removeItem("user");
      setUser(null);
      const response = await fetch("/user/logout");
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={`user-nav ${theme === "light" ? "user-nav-light" : null}`}>
      <Link className="logo" to="/portfolio">
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
