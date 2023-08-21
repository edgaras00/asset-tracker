import { useContext } from "react";
import { AppContext } from "./context/appContext";
import { Route, Routes, Navigate} from "react-router-dom";

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
      <Routes > 
        <Route exact path="/" element={<><Navbar/><Home/></>}/>
          {/* <Navbar /> */}
        <Route path="/login" element={user? <Navigate to="/portfolio"/> : <><Navbar/><Login/></>}/>
        <Route path="/signup" element={user? <Navigate to="/portfolio"/> : <><Navbar/><Signup/></>}/>
        <Route path="/portfolio" element={user?<><UserNav/><UserPortfolio/></> : <Navigate to="/login"/>}/>
        <Route path="/crypto/:cId" element={user? <><UserNav/><CryptoPage/></> : <Navigate to="/login"/>}/>
        <Route path="/company/:symbolId" element={user? <><UserNav/><CompanyPage/></> : <Navigate to="/login"/>}/>
        <Route path="/crypto-intro" element={<><Navbar/><CryptoHome/></>}/>
        <Route path="/stock-intro" element={<><Navbar/><StocksHome/></>}/>
         
      </Routes>
    </div>
  );
};

export default App;
