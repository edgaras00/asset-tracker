import { useState, useContext, useEffect } from "react";
import { AppContext } from "../../context/appContext";

// Components
import SummaryCard from "./SummaryCard";
import AssetButton from "./AssetButton";
import PortfolioList from "./PortfolioList";
import PieGraph from "./PieGraph";
import Activity from "./Activity";
import MarketNews from "../news/MarketNews";

// Utils
import { numberWithCommas, handleErrors } from "../../utils/utils";

import "./styles/userPortfolio.css";

const getTransactionHistory = async (type, token) => {
  // Function to fetch user's transaction history (stock or crypto)
  try {
    // Build URL
    let url = "https://alpha-assets-api.onrender.com/stocks/history";
    if (process.env.NODE_ENV === "development") {
      url = "/stocks/history";
    }

    if (type === "crypto") {
      url = "https://alpha-assets-api.onrender.com/crypto/history";
      if (process.env.NODE_ENV === "development") {
        url = "/crypto/history";
      }
    }

    // Get transaction data
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle failed GET requests
    if (response.status !== 200 || !response.ok) {
      handleErrors(response);
    }

    const transactionHistoryData = await response.json();

    return transactionHistoryData.data.txnHistory;
  } catch (error) {
    if (error.name === "authError") return "authError";
    if (error.name === "notFound") return "notFound";
    if (error.name === "serverError") return "serverError";
    return;
  }
};

const getPortfolio = async (type, token) => {
  // Get user's portfolio

  try {
    // Build URL
    let url = "https://alpha-assets-api.onrender.com/stocks/portfolio";
    if (process.env.NODE_ENV === "development") {
      url = "/stocks/portfolio";
    }

    if (type === "crypto") {
      url = "https://alpha-assets-api.onrender.com/crypto/portfolio";
      if (process.env.NODE_ENV === "development") {
        url = "/crypto/portfolio";
      }
    }

    // Get data from server
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle errors / failed GET requests
    if (response.status !== 200 || !response.ok) {
      handleErrors(response);
    }

    const portfolioData = await response.json();
    const portfolio = portfolioData.data.assets;

    if (portfolio.length === 0) {
      return [];
    }

    const { totalValue, totalROI, totalCost } = portfolioData.data;
    // Check if there is a positive return on investment
    const isValueIncrease = totalROI >= 0;

    return {
      totalValue,
      isValueIncrease,
      roi: totalROI,
      portfolio,
      cost: totalCost,
    };
  } catch (error) {
    console.log(error);
    if (error.name === "authError") return "authError";
    if (error.name === "notFound") return "notFound";
    if (error.name === "serverError") return "serverError";
    return;
  }
};

const UserPortfolio = () => {
  // User portfolio component
  // Holds user asset value information

  // Set up component state
  const [assetType, setAssetType] = useState("stock");
  const [portfolio, setPortfolio] = useState([]);

  const [assetCost, setAssetCost] = useState(null);
  const [assetValue, setAssetValue] = useState(0);
  const [percentGain, setPercentGain] = useState(null);
  const [increasing, setIncreasing] = useState(true);

  const [showGraphPercent, setShowGraphPercent] = useState(false);
  const [txnActivity, setTxnActivity] = useState([]);
  const [serverError, setServerError] = useState(0);

  const { theme, user, authErrorLogout } = useContext(AppContext);
  const token = localStorage.getItem("token");
  console.log(token);

  const clearPortfolio = (isError = false) => {
    // Clear portfolio state data
    if (isError) {
      setServerError(1);
    }
    setPortfolio([]);
    setAssetValue(0);
    setAssetCost(0);
    setPercentGain(null);
  };

  // Update user and portfolio state data
  useEffect(() => {
    const getPortfolioData = async (assetType, token) => {
      // Store updated user data
      localStorage.setItem("user", JSON.stringify(user));
      const portfolioData = await getPortfolio(assetType, token);
      if (!portfolioData) {
        clearPortfolio(true);
        return;
      }
      if (portfolioData === "authError") {
        authErrorLogout();
        return;
      } else if (
        portfolioData === "notFound" ||
        portfolioData === "serverError"
      ) {
        clearPortfolio(true);
        return;
      }
      if (portfolioData.length === 0) {
        clearPortfolio(false);
        return;
      }
      setAssetValue(portfolioData.totalValue);
      setIncreasing(portfolioData.isPriceIncrease);
      setPercentGain(portfolioData.roi);
      setPortfolio(portfolioData.portfolio);
      setAssetCost(portfolioData.cost);
    };
    const getTxnHistoryData = async (assetType, token) => {
      const txnHistory = await getTransactionHistory(assetType, token);
      if (txnHistory === "authError") {
        authErrorLogout();
        return;
      } else if (txnHistory === "notFound" || txnHistory === "serverError") {
        setTxnActivity([]);
        return;
      }
      setTxnActivity(txnHistory);
    };
    if (token) {
      getPortfolioData(assetType, token);
      getTxnHistoryData(assetType, token);
    }
  }, [assetType, user, authErrorLogout, token]);

  return (
    <div
      className={`dashboard-container ${
        theme === "light" ? "dashboard-light" : null
      }`}
    >
      <div className="select-assets">
        <AssetButton type="stock" theme={theme} onClick={setAssetType} />
        <AssetButton type="crypto" theme={theme} onClick={setAssetType} />
      </div>

      <div className="portfolio-summary">
        <SummaryCard
          title="Value"
          value={assetValue ? numberWithCommas(assetValue.toFixed(2)) : null}
          theme={theme}
          type="usd"
        />

        <SummaryCard
          title="Cost"
          value={assetCost ? numberWithCommas(assetCost.toFixed(2)) : null}
          theme={theme}
          type="usd"
        />
        <SummaryCard
          title="Total Gain"
          value={percentGain ? parseFloat(percentGain.toFixed(2)) : null}
          theme={theme}
          type="percent"
          increasing={increasing}
        />
      </div>
      <div
        className={`portfolio-container ${
          theme === "light" ? "portfolio-container-light" : null
        }`}
      >
        <PortfolioList
          portfolio={portfolio}
          assetType={assetType}
          setPortfolio={setPortfolio}
          theme={theme}
          serverError={serverError}
        />
      </div>
      {portfolio.length > 0 ? (
        <div
          className={`title ${
            theme === "light" ? "title-light" : null
          } asset-dist`}
        >
          <h2 className="section-header">Asset Distribution</h2>
          <br />
          {showGraphPercent ? (
            <h3
              onClick={() => setShowGraphPercent(false)}
              className="toggle-distribution"
            >
              Show USD
            </h3>
          ) : (
            <h3
              onClick={() => setShowGraphPercent(true)}
              className="toggle-distribution"
            >
              Show Percent
            </h3>
          )}
        </div>
      ) : null}

      {portfolio.length > 0 ? (
        <div
          className={`analytics-container ${
            theme === "light" ? "analytics-container-light" : ""
          }`}
        >
          <PieGraph
            portfolio={portfolio}
            assetValue={assetValue}
            showPercent={showGraphPercent}
          />
        </div>
      ) : null}
      <div className={`title ${theme === "light" ? "title-light" : null}`}>
        <h2 className="section-header">Activity</h2>
      </div>
      <Activity
        transactionHistory={txnActivity}
        assetType={assetType}
        theme={theme}
      />
      <div className={`title ${theme === "light" ? "title-light" : null}`}>
        <h2 className="section-header">News</h2>
      </div>
      <div className="market-news-container">
        <MarketNews />
      </div>
    </div>
  );
};

export default UserPortfolio;
