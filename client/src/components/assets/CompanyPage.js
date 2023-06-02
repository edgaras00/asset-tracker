import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/appContext";

import Chart from "./Chart";
import CompanyInfo from "./CompanyInfo";
import BalanceSheet from "./BalanceSheet";
import IncomeStatement from "./IncomeStatement";
import CashFlow from "./CashFlow";
import CompanyNews from "../news/CompanyNews";
import Unavailable from "../errors/Unavailable";

import {
  numberWithCommas,
  handleErrors,
  getAssetNews,
} from "../../utils/utils";

import "./styles/companyPage.css";

const getPriceData = async (symbolId, timeFrame, token) => {
  try {
    let url = `https://alpha-assets-api.onrender.com/stocks/prices/${symbolId}?interval=${timeFrame}`;
    if (process.env.NODE_ENV === "development") {
      url = `/stocks/prices/${symbolId}?interval=${timeFrame}`;
    }
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Handle server error
    if (response.status !== 200) {
      handleErrors(response);
    }

    const priceData = await response.json();
    return priceData.data;
  } catch (error) {
    console.error(error);
    if (error.name === "authError") return "authError";
    return -1;
  }
};

const getMarketData = async (symbolId, timeFrame, token) => {
  try {
    let url = `https://alpha-assets-api.onrender.com/stocks/prices/${symbolId}?interval=${timeFrame}&type=market`;
    if (process.env.NODE_ENV === "development") {
      url = `/stocks/prices/${symbolId}?interval=${timeFrame}&type=market`;
    }
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status !== 200) {
      handleErrors(response);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.log(error);
    if (error.name === "authError") return "authError";
    return -1;
  }
};

const fetchCompanyData = async (symbolId, type, token) => {
  try {
    const symbol = symbolId.toLowerCase();
    let url;
    if (type === "overview") {
      url = `https://alpha-assets-api.onrender.com/stocks/overview/${symbol}`;
      if (process.env.NODE_ENV === "development") {
        url = `/stocks/overview/${symbol}`;
      }
    } else if (type === "income") {
      url = `https://alpha-assets-api.onrender.com/stocks/income/${symbol}`;
      if (process.env.NODE_ENV === "development") {
        url = `/stocks/income/${symbol}`;
      }
    } else if (type === "cash") {
      url = `https://alpha-assets-api.onrender.com/stocks/cash/${symbol}`;
      if (process.env.NODE_ENV === "development") {
        url = `/stocks/cash/${symbol}`;
      }
    } else if (type === "balance") {
      url = `https://alpha-assets-api.onrender.com/stocks/balance/${symbol}`;
      if (process.env.NODE_ENV === "development") {
        url = `/stocks/balance/${symbol}`;
      }
    }
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status !== 200) {
      handleErrors(response);
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
    if (dataArray.includes("authError")) {
      return "authError";
    }
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

  const { theme, authErrorLogout } = useContext(AppContext);
  const { symbolId } = useParams();

  const [timeFrame, setTimeFrame] = useState("week");
  const [hideX, setHideX] = useState(false);
  const [company, setCompany] = useState(null);
  const [price, setPrice] = useState(0);
  const [change, setChange] = useState(null);
  const [changePercent, setChangePercent] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [assetNews, setAssetNews] = useState([]);
  const token = localStorage.getItem("token");

  const handleHide = () => setHideX(false);

  // Class for styling price difference
  // Green if > 0
  // Red if < 0
  const percentClass = changePercent && changePercent < 0 ? "percent-dec" : "";

  // Fix GOOGLE symbol
  let symbolClass = "company-symbol";
  if (symbolClass === "GOOGL") {
    symbolClass = "company-symbol google";
  }

  useEffect(() => {
    const fetchData = async (symbolId, timeFrame) => {
      const priceData = await getPriceData(symbolId, timeFrame, token);
      const companyMarketData = await getMarketData(symbolId, timeFrame, token);

      if (priceData === "authError" || companyMarketData === "authError") {
        authErrorLogout();
        return;
      }

      if (priceData !== -1 && companyMarketData !== -1) {
        setPrice(priceData.price);
        setChange(priceData.priceChange);
        setChangePercent(priceData.percentChange);
        setMarketData(companyMarketData);
      } else {
        setPrice(-1);
      }
      return;
    };
    fetchData(symbolId, timeFrame);
  }, [timeFrame, symbolId, authErrorLogout, token]);

  useEffect(() => {
    const getCompany = async (symbolId) => {
      try {
        const companyData = await fetchAllCompanyData([
          fetchCompanyData(symbolId, "overview", token),
          fetchCompanyData(symbolId, "income", token),
          fetchCompanyData(symbolId, "balance", token),
          fetchCompanyData(symbolId, "cash", token),
        ]);

        if (companyData === "authError") {
          authErrorLogout();
          return;
        }

        setCompany(companyData);
      } catch (error) {
        console.log(error);
      }
    };

    const getNews = async (symbolId) => {
      const news = await getAssetNews(symbolId);
      setAssetNews(news);
    };

    getCompany(symbolId);
    getNews(symbolId);
  }, [symbolId, authErrorLogout, token]);

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
        <div className={symbolClass}>
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
            {changePercent ? changePercent : 0}%)
          </span>
        </div>
        <div className="balance-history">
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
      {company ? <CompanyInfo overview={company.overview} /> : null}
      {company ? <BalanceSheet balance={company.balance} /> : null}
      {company ? <IncomeStatement income={company.income} /> : null}
      {company ? <CashFlow cash={company.cash} /> : null}
      <CompanyNews newsData={assetNews} />
    </div>
  );
};

export default CompanyPage;
