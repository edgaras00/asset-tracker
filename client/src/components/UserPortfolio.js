import React, { useState, useContext, useEffect } from "react";
import PortfolioList from "./PortfolioList";
import MarketNews from "./MarketNews";
import { AppContext } from "../context/appContext";
import { numberWithCommas } from "../utils/utils";
import PieGraph from "./PieGraph";
import Activity from "./Activity";
import "../styles/userPortfolio.css";

const getTxnHistory = async (type) => {
  try {
    let url = "/stocks/history";

    if (type === "crypto") {
      url = "/crypto/history";
    }

    const response = await fetch(url);
    const txnHistoryData = await response.json();

    return txnHistoryData.data.txnHistory;
  } catch (error) {
    console.log(error);
  }
};

const getPortfolio = async (type) => {
  try {
    let url = "/stocks/portfolio";

    if (type === "crypto") {
      url = "/crypto/portfolio";
    }

    const response = await fetch(url);
    const data = await response.json();

    const portfolio = data.data.assets;

    if (portfolio.length === 0) {
      return;
    }

    const { totalValue, totalROI, totalCost } = data.data;
    const isPriceIncrease = totalROI >= 0;

    return {
      totalValue,
      isPriceIncrease,
      roi: totalROI,
      portfolio,
      cost: totalCost,
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
  const [txnActivity, setTxnActivity] = useState([]);

  const { theme, user } = useContext(AppContext);

  // Class for different theme styles
  const colorClassInc = theme === "light" ? "percent-inc-light" : "percent-inc";

  // Update user and portfolio state data
  useEffect(() => {
    const setupData = async (assetType) => {
      localStorage.setItem("user", JSON.stringify(user));
      const assetData = await getPortfolio(assetType);
      if (!assetData) {
        setPortfolio([]);
        setAssetValue(0);
        setAssetCost(0);
        setPercentGain(null);
        return;
      }
      setAssetValue(assetData.totalValue);
      setIncreasing(assetData.isPriceIncrease);
      setPercentGain(assetData.roi);
      setPortfolio(assetData.portfolio);
      setAssetCost(assetData.cost);
    };

    const setupTxnHistoryData = async (assetType) => {
      const txnHistory = await getTxnHistory(assetType);
      setTxnActivity(txnHistory);
    };

    setupData(assetType);
    setupTxnHistoryData(assetType);
  }, [assetType, user]);

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
      <Activity txnHistory={txnActivity} assetType={assetType} theme={theme} />
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
