import { useContext } from "react";
import { AppContext } from "./context/appContext";
import { Switch, Route, Redirect } from "react-router-dom";

// Home
import Home from "./components/home/Home";
import Navbar from "./components/home/Navbar";
import Login from "./components/home/Login";
import Signup from "./components/home/Signup";
import StocksHome from "./components/home/StocksHome";
import CryptoHome from "./components/home/CryptoHome";

// User
import UserPortfolio from "./components/user/UserPortfolio";
import UserNav from "./components/user/UserNav";

// Assets
import CompanyPage from "./components/assets/CompanyPage";
import CryptoPage from "./components/assets/CryptoPage";

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
