import React, { useState } from "react";
const AppContext = React.createContext();

const AppContextProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, user, setUser }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContextProvider, AppContext };
