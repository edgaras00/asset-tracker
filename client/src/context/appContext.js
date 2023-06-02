import React, { useState } from "react";
const AppContext = React.createContext();

const AppContextProvider = ({ children }) => {
  // const [theme, setTheme] = useState("dark");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const toggleTheme = () => {
    // setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
    setTheme((prevTheme) => {
      const theme = prevTheme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", theme);
      return theme;
    });
  };

  const authErrorLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        setUser,
        authErrorLogout,
        token,
        setToken,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContextProvider, AppContext };
