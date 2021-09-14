import React, {useContext} from 'react';
import {ThemeContext} from './context/themeContext';
import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import Home from './components/Home'
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import UserPortfolio from './components/UserPortfolio';
import UserNav from './components/UserNav';
import CompanyPage from './components/CompanyPage';
import CryptoPage from './components/CryptoPage';
import CryptoHome from './components/CryptoHome';
import StocksHome from './components/StocksHome';

const App = () => {

  const {user} = useContext(ThemeContext);

  return (
    <div>
      <Switch>
        <Route exact path="/">
          <Navbar />
          <Home />
        </Route>
        <Route path="/login">
          {
            user? <Redirect to="/user"/> : <div><Navbar/><Login/></div>
          }
        </Route>
        <Route path="/signup">
          {
            user? <Redirect to="/user"/> : <div><Navbar/><Signup/></div>
          }
        </Route>
        <Route path="/user">
          <UserNav />
          {
            user? <UserPortfolio /> : <Redirect to="/login"/>
          }
        </Route>
        <Route path='/crypto/:cId'>
          <UserNav />
          {
            user? <CryptoPage /> : <Redirect to='/login' />
          }
          {/* <CryptoPage /> */}
        </Route>
        <Route path='/company/:symbolId'>
          <UserNav />
          {
            user? <CompanyPage /> : <Redirect to="/login"/>
          }
          {/* <CompanyPage/> */}
        </Route>
        <Route path='/crypto-intro'>
          <Navbar />
          <CryptoHome />
        </Route>
        <Route path='/stock-intro'>
          <Navbar />
          <StocksHome />
        </Route>
      </Switch>
    </div>
  );
};

export default App;