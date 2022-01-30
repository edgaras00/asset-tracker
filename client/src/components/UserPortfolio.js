import React, { useState, useContext, useEffect } from "react";
import PortfolioList from "./PortfolioList";
import MarketNews from "./MarketNews";
import { AppContext } from "../context/appContext";
import { numberWithCommas, handleErrors } from "../utils/utils";
import PieGraph from "./PieGraph";
import Activity from "./Activity";
import SummaryCard from "./SummaryCard";
import AssetButton from "./AssetButton";
import "../styles/userPortfolio.css";

const getTxnHistory = async (type) => {
  try {
    let url = "/stocks/history";

    if (type === "crypto") {
      url = "/crypto/history";
    }

    const response = await fetch(url);

    // Handle failed GET requests
    if (response.status !== 200 || !response.ok) {
      handleErrors(response);
    }

    const txnHistoryData = await response.json();

    return txnHistoryData.data.txnHistory;
  } catch (error) {
    if (error.name === "authError") return "authError";
    if (error.name === "notFound") return "notFound";
    if (error.name === "serverError") return "serverError";
    return;
  }
};

const getPortfolio = async (type) => {
  try {
    let url = "/stocks/portfolio";

    if (type === "crypto") {
      url = "/crypto/portfolio";
    }

    const response = await fetch(url);

    // Handle errors / failed GET requests
    if (response.status !== 200 || !response.ok) {
      handleErrors(response);
    }

    const data = await response.json();
    const portfolio = data.data.assets;

    if (portfolio.length === 0) {
      return [];
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
    if (error.name === "authError") return "authError";
    if (error.name === "notFound") return "notFound";
    if (error.name === "serverError") return "serverError";
    return;
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
  const [serverError, setServerError] = useState(0);

  const { theme, user, authErrorLogout } = useContext(AppContext);
  // Class for different theme styles

  const clearPortfolio = (isError = false) => {
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
    const setupData = async (assetType) => {
      localStorage.setItem("user", JSON.stringify(user));
      const assetData = await getPortfolio(assetType);

      if (assetData === "authError") {
        authErrorLogout();
        return;
      } else if (assetData === "notFound" || assetData === "serverError") {
        clearPortfolio(true);
        return;
      }

      if (assetData.length === 0) {
        clearPortfolio(false);
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

      if (txnHistory === "authError") {
        authErrorLogout();
        return;
      } else if (txnHistory === "notFound" || txnHistory === "serverError") {
        setTxnActivity([]);
        return;
      }
      setTxnActivity(txnHistory);
    };

    setupData(assetType);
    setupTxnHistoryData(assetType);
  }, [assetType, user, authErrorLogout]);

  return (
    <div
      className={`dashboard-container ${
        theme === "light" ? "dashboard-light" : null
      }`}
    >
      <div className="select-assets">
        <AssetButton type="stocks" theme={theme} handleClick={setAssetType} />
        <AssetButton type="crypto" theme={theme} handleClick={setAssetType} />
      </div>

      <div className="portfolio-summary">
        <SummaryCard
          header="Value"
          value={assetValue ? numberWithCommas(assetValue.toFixed(2)) : null}
          theme={theme}
          type="usd"
        />

        <SummaryCard
          header="Cost"
          value={assetCost ? numberWithCommas(assetCost.toFixed(2)) : null}
          theme={theme}
          type="usd"
        />
        <SummaryCard
          header="Total Gain"
          value={percentGain ? percentGain.toFixed(2) : null}
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
