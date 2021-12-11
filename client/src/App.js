import React, { useContext } from "react";
import { AppContext } from "./context/appContext";
import { Switch, Route, Redirect } from "react-router-dom";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import UserPortfolio from "./components/UserPortfolio";
import UserNav from "./components/UserNav";
import CompanyPage from "./components/CompanyPage";
import CryptoPage from "./components/CryptoPage";
import CryptoHome from "./components/CryptoHome";
import StocksHome from "./components/StocksHome";

const App = () => {
  const { user } = useContext(AppContext);

  return (
    <div>
      <Switch>
        <Route exact path="/">
          <Navbar />
          <Home />
        </Route>
        <Route path="/login">
          {user ? (
            <Redirect to="/portfolio" />
          ) : (
            <div>
              <Navbar />
              <Login />
            </div>
          )}
        </Route>
        <Route path="/signup">
          {user ? (
            <Redirect to="/portfolio" />
          ) : (
            <div>
              <Navbar />
              <Signup />
            </div>
          )}
        </Route>
        <Route path="/portfolio">
          <UserNav />
          {user ? <UserPortfolio /> : <Redirect to="/login" />}
        </Route>
        <Route path="/crypto/:cId">
          <UserNav />
          {user ? <CryptoPage /> : <Redirect to="/login" />}
        </Route>
        <Route path="/company/:symbolId">
          <UserNav />
          {user ? <CompanyPage /> : <Redirect to="/login" />}
        </Route>
        <Route path="/crypto-intro">
          <Navbar />
          <CryptoHome />
        </Route>
        <Route path="/stock-intro">
          <Navbar />
          <StocksHome />
        </Route>
      </Switch>
    </div>
  );
};

export default App;
