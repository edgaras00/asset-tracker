import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import Chart from "./Chart";
import CompanyInfo from "./CompanyInfo";
import BalanceSheet from "./BalanceSheet";
import IncomeStatement from "./IncomeStatement";
import CashFlow from "./CashFlow";
import CompanyNews from "./CompanyNews";
import Unavailable from "./Unavailable";
import { AppContext } from "../context/appContext";
import { numberWithCommas, handleAuthDataError } from "../utils/utils";
import "../styles/companyPage.css";

const getPriceData = async (symbolId, timeFrame) => {
  try {
    const url = `/stocks/current/${symbolId}?interval=${timeFrame}`;
    const response = await fetch(url);
    // Handle server error

    // if (response.status === 500) {
    //   throw new Error("Something went wrong. Data unavailable");
    // }

    const priceData = await response.json();

    if (response.status !== 200) {
      if (response.status === 401) {
        handleAuthDataError(priceData);
      }
      throw new Error("Something went wrong. Data unavailable");
    }

    return priceData.data;
  } catch (error) {
    console.log(error);
    return -1;
  }
};

const getMarketData = async (symbolId, timeFrame) => {
  try {
    const baseUrl = "/stocks/prices/";
    const api = `${symbolId}?period=${timeFrame}`;
    const response = await fetch(baseUrl + api);

    // if (response.status === 500) {
    //   throw new Error("Something went wrong. Data unavailable");
    // }

    const data = await response.json();

    if (response.status !== 200) {
      if (response.status === 401) {
        handleAuthDataError(data);
      }
      throw new Error("Something went wrong. Data unavailable");
    }

    return data.data;
  } catch (error) {
    console.log(error);
    if (error.name === "authError") return "authError";
    return -1;
  }
};

const fetchCompanyData = async (symbolId, type) => {
  try {
    const symbol = symbolId.toLowerCase();
    let url;
    switch (type) {
      case "overview":
        url = `/stocks/overview/${symbol}`;

        break;
      case "income":
        url = `/stocks/income/${symbol}`;

        break;
      case "balance":
        url = `/stocks/balance/${symbol}`;

        break;
      case "cash":
        url = `/stocks/cash/${symbol}`;

        break;
      default:
        break;
    }
    const response = await fetch(url);

    if (response.status === 500) {
      throw new Error("Something went wrong. Data unavailable");
    }

    const data = await response.json();

    if (type === "overview") {
      return { overview: data.data.data };
    }

    if (type === "income") {
      return { income: data.data.data };
    }

    if (type === "balance") {
      return { balance: data.data.data };
    }

    if (type === "cash") {
      return { cash: data.data.data };
    }
  } catch (error) {
    console.log(error);
    if (error.name === "authError") return "authError";
    return -1;
  }
};

const fetchAllCompanyData = async (dataFetches) => {
  try {
    const dataArray = await Promise.all(dataFetches);
    const companyData = {};
    dataArray.forEach((item) => {
      const key = Object.keys(item)[0];
      companyData[key] = item[key];
    });
    return companyData;
  } catch (error) {
    console.log();
  }
};

const CompanyPage = () => {
  // Component that renders company information

  const { theme, setUser } = useContext(AppContext);
  const [timeFrame, setTimeFrame] = useState("day");
  const [hideX, setHideX] = useState(false);
  const handleHide = () => setHideX(false);
  const { symbolId } = useParams();
  const [company, setCompany] = useState(null);
  const [price, setPrice] = useState(0);
  const [change, setChange] = useState(null);
  const [changePercent, setChangePercent] = useState(null);
  const [marketData, setMarketData] = useState([]);

  // Class for styling price difference
  // Green if > 0
  // Red if < 0
  const percentClass = changePercent && changePercent < 0 ? "percent-dec" : "";

  useEffect(() => {
    const fetchData = async (symbolId, timeFrame) => {
      const priceData = await getPriceData(symbolId, timeFrame);
      const companyMarketData = await getMarketData(symbolId, timeFrame);

      if (priceData === "authError" || companyMarketData === "authError") {
        localStorage.removeItem("user");
        setUser(null);
        return;
      }

      if (priceData !== -1 && companyMarketData !== -1) {
        setPrice(priceData.price);
        setChange(priceData.change);
        setChangePercent(priceData.changePercent);
        setMarketData(companyMarketData.assetValue);
      } else {
        setPrice(-1);
      }
      return;
    };
    fetchData(symbolId, timeFrame);
  }, [timeFrame, symbolId, setUser]);

  useEffect(() => {
    const getCompany = async (symbolId) => {
      const companyData = await fetchAllCompanyData([
        fetchCompanyData(symbolId, "overview"),
        fetchCompanyData(symbolId, "income"),
        fetchCompanyData(symbolId, "balance"),
        fetchCompanyData(symbolId, "cash"),
      ]);
      console.log(companyData);
      setCompany(companyData);
    };
    getCompany(symbolId);
  }, [symbolId]);

  if (price === -1) {
    return <Unavailable param={symbolId} theme={theme} />;
  }

  return (
    <div
      className={`company-page-container ${
        theme === "light" ? "company-page-container-light" : null
      }`}
    >
      <div className="company-chart-container">
        <div className="company-symbol">
          <img
            src={`https://storage.googleapis.com/iex/api/logos/${symbolId}.png`}
            alt="company"
          />
          <h1>{symbolId}</h1>
        </div>
        <h1 className="asset-price">
          ${price ? numberWithCommas(price.toFixed(2)) : 0}
        </h1>
        <div
          className={`company-asset-change ${
            theme === "light" ? "company-asset-change-light" : null
          } ${percentClass}`}
        >
          <span>
            {changePercent < 0 ? "-" : ""}$
            {change ? numberWithCommas(Math.abs(change.toFixed(2))) : 0} (
            {changePercent ? changePercent.toFixed(2) : 0}%)
          </span>
        </div>
        <div className="balance-history">
          <div
            onClick={() => {
              setHideX(true);
              setTimeFrame("day");
            }}
          >
            1D
          </div>
          <div
            onClick={() => {
              setHideX(true);
              setTimeFrame("week");
            }}
          >
            1W
          </div>
          <div
            onClick={() => {
              setHideX(true);
              setTimeFrame("month");
            }}
          >
            1M
          </div>
          <div
            onClick={() => {
              setHideX(true);
              setTimeFrame("year");
            }}
          >
            1Y
          </div>
        </div>
        <br />
        <Chart
          timeFrame={timeFrame}
          handle={handleHide}
          hide={hideX}
          priceChange={changePercent}
          valueData={marketData}
        />
      </div>
      {/* {company ? <CompanyInfo overview={company.overview} /> : null}
      {company ? <BalanceSheet balance={company.balance} /> : null}
      {company ? <IncomeStatement income={company.income} /> : null}
      {company ? <CashFlow cash={company.cash} /> : null} */}
      <CompanyNews />
    </div>
  );
};

export default CompanyPage;
