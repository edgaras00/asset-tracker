import React, { useState, useContext, useEffect } from "react";
import PortfolioList from "./PortfolioList";
import MarketNews from "./MarketNews";
import { ThemeContext } from "../context/themeContext";
import { numberWithCommas } from "../utils/utils";
import PieGraph from "./PieGraph";
import Activity from "./Activity";
import "../styles/userPortfolio.css";

const getPortfolio = async (assets, type) => {
  /* 
    Async function to get a user's portfolio value data.

    Parameters:
      assets:
        User asset object.
      type:
        Asset type (string): 'stocks' | 'crypto'
    Returns:
      Object containing asset portfolio value data:
        {
          totalValue: total asset value (Number)
          isPriceIncrease: is price increasing (Bool)
          roi: Percent return on investment (Number)
          cost: Total asset cost (Number)
        }
  
  */
  try {
    // Prepare for server request
    // Stock req query params take in an asset list in symbol:amount:cost format
    let assetsArr = assets.stockInfo.stocks.map(
      (stock) => `${stock.symbol}:${stock.amount}:${stock.cost}`
    );
    let cost = assets.stockInfo.cost;
    if (type === "crypto") {
      // Crypto query params take in an asset list in cid:amount:cost format
      // cid: Coingecko id for specific crypto
      assetsArr = assets.cryptoInfo.crypto.map(
        (crypto) => `${crypto.cid}:${crypto.amount}:${crypto.cost}`
      );
      cost = assets.cryptoInfo.cost;
    }
    // Join array into a single string
    // Default: stock data
    const symbols = assetsArr.join(",");
    let url = `http://localhost:5000/stocks/current_batch?stocks=${symbols}`;

    // If crypto
    if (type === "crypto") {
      url = `http://localhost:5000/crypto/current_batch?coins=${symbols}`;
    }

    // Server request
    const response = await fetch(url);
    const data = await response.json();

    // Calculate total asset value, roi, and determine if price is increasing
    let totalValue = 0;
    data.assets.forEach((asset) => (totalValue += asset.value));
    const roi = ((totalValue - cost) / cost) * 100;
    const isPriceIncrease = roi >= 0;
    const portfolio = data.assets;

    return {
      totalValue,
      isPriceIncrease,
      roi,
      portfolio,
      cost,
    };
  } catch (error) {
    console.log(error);
  }
};

const UserPortfolio = () => {
  // User portfolio component
  // Holds user's asset value information

  // Set up component state
  const [assetType, setAssetType] = useState("stocks");
  const [assetCost, setAssetCost] = useState(null);
  const [assetValue, setAssetValue] = useState(0);
  const [percentGain, setPercentGain] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [increasing, setIncreasing] = useState(true);
  const [showGraphPercent, setShowGraphPercent] = useState(false);
  const { theme, user } = useContext(ThemeContext);

  // Class for different theme styles
  const colorClassInc = theme === "light" ? "percent-inc-light" : "percent-inc";

  // Update user and portfolio state data
  useEffect(() => {
    const setupData = async (user, assetType) => {
      localStorage.setItem("user", JSON.stringify(user));
      const dataObj = await getPortfolio(user.assets, assetType);
      setAssetValue(dataObj.totalValue);
      setIncreasing(dataObj.isPriceIncrease);
      setPercentGain(dataObj.roi);
      setPortfolio(dataObj.portfolio);
      setAssetCost(dataObj.cost);
    };

    if (assetType === "stocks") {
      if (user && user.assets.stockInfo.stocks.length > 0) {
        setupData(user, assetType);
        return;
      }
      setPortfolio([]);
      setAssetValue(0);
      setAssetCost(0);
      setPercentGain(null);
    }

    if (assetType === "crypto") {
      if (user && user.assets.cryptoInfo.crypto.length > 0) {
        setupData(user, assetType);
        return;
      }
      setPortfolio([]);
      setAssetValue(0);
      setAssetCost(0);
      setPercentGain(null);
    }
  }, [user, assetType]);

  return (
    <div
      className={`dashboard-container ${
        theme === "light" ? "dashboard-light" : null
      }`}
    >
      <div className="select-assets">
        <button
          className={`stock-button ${
            theme === "light" ? "stock-btn-light" : null
          }`}
          onClick={() => {
            setAssetType("stocks");
          }}
        >
          Stocks
        </button>
        <button
          className={`crypto-button ${
            theme === "light" ? "crypto-btn-light" : null
          }`}
          onClick={() => setAssetType("crypto")}
        >
          Crypto
        </button>
      </div>

      <div className="portfolio-summary">
        <div
          className={`summary-cell ${
            theme === "light" ? "summary-cell-light" : null
          }`}
        >
          <h3>Value</h3>
          {assetValue ? (
            <h1>${numberWithCommas(assetValue.toFixed(2))}</h1>
          ) : null}
        </div>
        <div
          className={`summary-cell ${
            theme === "light" ? "summary-cell-light" : null
          }`}
        >
          <h3>Cost</h3>
          {assetCost ? <h1>{numberWithCommas(assetCost.toFixed(2))}</h1> : null}
        </div>
        <div
          className={`summary-cell ${
            theme === "light" ? "summary-cell-light" : null
          }`}
        >
          <h3>Total Gain</h3>
          {percentGain ? (
            <h1 className={increasing ? colorClassInc : "percent-change-dec"}>
              {percentGain.toFixed(2)}%
            </h1>
          ) : null}
        </div>
      </div>
      <div
        className={`portfolio-container ${
          theme === "light" ? "portfolio-container-light" : null
        }`}
      >
        <PortfolioList
          portfolio={portfolio}
          user={user}
          assetType={assetType}
          setPortfolio={setPortfolio}
          theme={theme}
        />
      </div>
      {portfolio.length > 0 ? (
        <div
          className={`title ${
            theme === "light" ? "title-light" : null
          } asset-dist`}
        >
          <h1>Asset Distribution</h1>
          <br />
          {showGraphPercent ? (
            <h3 onClick={() => setShowGraphPercent(false)}>Show USD</h3>
          ) : (
            <h3 onClick={() => setShowGraphPercent(true)}>Show Percent</h3>
          )}
        </div>
      ) : null}

      {portfolio.length > 0 ? (
        <div
          className={`analytics-container ${
            theme === "light" ? "analytics-container-light" : null
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
        <h1>Activity</h1>
      </div>
      <Activity
        txnHistory={user.txnHistory}
        assetType={assetType}
        theme={theme}
      />
      <div className={`title ${theme === "light" ? "title-light" : null}`}>
        <h1>News</h1>
      </div>
      <div className="market-news-container">
        <MarketNews />
      </div>
    </div>
  );
};

export default UserPortfolio;
