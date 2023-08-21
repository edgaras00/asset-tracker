import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from "react-router-dom";
import { AppContextProvider } from "./context/appContext";

import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppContextProvider>
    <Router>
      <App />
    </Router>
    </AppContextProvider>
  </React.StrictMode>,
)
