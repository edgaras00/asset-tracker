import React, {useState} from 'react';
const ThemeContext = React.createContext();

const ThemeContextProvider = ({children}) => {

    const [theme, setTheme] = useState('dark');
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark'? 'light' : 'dark');
    }

    return (
        <ThemeContext.Provider value={{theme, toggleTheme, user, setUser}}>
            {children}
        </ThemeContext.Provider>
    )
}

export {ThemeContextProvider, ThemeContext};