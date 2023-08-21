import { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/appContext";

import lightModeIcon from "../../images/light.svg";
import darkModeIcon from "../../images/dark.svg";

import "./styles/userNav.css";

const UserNav = () => {
  // Navbar component (User page)

  const { theme, toggleTheme, setUser } = useContext(AppContext);

  const logout = async () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      let url = "https://alpha-assets-api.onrender.com/user/logout";
      if (import.meta.env.REACT_APP_ENV === "development") {
        url = "/user/logout";
      }

      await fetch(url);
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
          {theme === "light" ? (
            <img src={darkModeIcon} alt="dark mode" className="theme-icon" />
          ) : (
            <img src={lightModeIcon} alt="light mode" className="theme-icon" />
          )}
        </span>
        <span onClick={logout} id="logout">
          Sign Out
        </span>
      </div>
    </div>
  );
};

export default UserNav;
