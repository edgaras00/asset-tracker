import { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/appContext";

import Chart from "./Chart";
import CryptoMarket from "./CryptoMarket";
import CryptoExchange from "./CryptoExchange";
import CompanyNews from "../news/CompanyNews";
import Unavailable from "../errors/Unavailable";

import {
  numberWithCommas,
  handleErrors,
  getAssetNews,
} from "../../utils/utils";
import "./styles/cryptoPage.css";
import "./styles/assetInfo.css";

const fetchPriceData = async (cId, timeFrame, token) => {
  try {
    let url = `https://alpha-assets-api.onrender.com/crypto/prices/${cId}?interval=${timeFrame}`;
    if (import.meta.env.REACT_APP_ENV === "development") {
      url = `/crypto/prices/${cId}?interval=${timeFrame}`;
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

const getCurrentPrice = async (cId, timeFrame, token) => {
  try {
    let baseUrl = "https://alpha-assets-api.onrender.com/crypto/current/";
    if (import.meta.env.REACT_APP_ENV === "development") {
      baseUrl = "/crypto/current/";
    }
    const api = `${cId}?interval=${timeFrame}`;

    const response = await fetch(baseUrl + api, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status !== 200) {
      handleErrors(response);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    if (error.name === "authError") return "authError";
    return -1;
  }
};

const fetchCryptoData = async (cId, token) => {
  try {
    let url = `https://alpha-assets-api.onrender.com/crypto/data/${cId}`;
    if (import.meta.env.REACT_APP_ENV === "development") {
      url = `/crypto/data/${cId}`;
    }
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status !== 200) {
      handleErrors(response);
    }

    const metadata = await response.json();
    return metadata.data;
  } catch (error) {
    console.log(error);
    if (error.name === "authError") return "authError";
    return -1;
  }
};

const CryptoPage = () => {
  // Component that displays information about a particular crypto asset

  // Set up component state
  const { theme, authErrorLogout, token } = useContext(AppContext);
  const [timeFrame, setTimeFrame] = useState("week");
  const [expandContent, setExpandContent] = useState(false);
  const [cryptoData, setCryptoData] = useState(null);
  const [price, setPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [hideX, setHideX] = useState(false);
  const [asetNews, setAssetNews] = useState([]);
  const handleHide = () => setHideX(false);

  const { cId } = useParams();

  const priceChangeClass = priceChange && priceChange < 0 ? "percent-dec" : "";

  useEffect(() => {
    const getCryptoInfo = async (cId, token) => {
      try {
        const cryptoData = await fetchCryptoData(cId, token);

        if (cryptoData === "authError") {
          authErrorLogout();
          return;
        }
        setCryptoData(cryptoData);
      } catch (error) {
        console.log(error);
        setCryptoData(null);
      }
    };

    const getNews = async (cId, token) => {
      try {
        const news = await getAssetNews(cId, token);
        setAssetNews(news);
      } catch (error) {
        console.log(error);
        setAssetNews([]);
      }
    };
    getCryptoInfo(cId, token);
    getNews(cId, token);
  }, [cId, authErrorLogout, token]);

  useEffect(() => {
    const fetchMarketData = async (cId, timeFrame, token) => {
      const cryptoMarketData = await fetchPriceData(cId, timeFrame, token);
      const priceData = await getCurrentPrice(cId, timeFrame, token);

      if (cryptoMarketData === "authError" || priceData === "authError") {
        authErrorLogout();
        return;
      }

      if (priceData !== -1 && cryptoMarketData !== -1) {
        let assetPrice = priceData.data[cId].usd;
        if (assetPrice >= 1000) {
          assetPrice = numberWithCommas(priceData.data[cId].usd);
        }
        const percentChange =
          timeFrame === "day"
            ? priceData.data[cId].usd_24h_change
            : priceData.data.percentChange;
        setMarketData(cryptoMarketData);
        setPriceChange(percentChange);
        setPrice(assetPrice);
      }
    };
    fetchMarketData(cId, timeFrame, token);
  }, [cId, timeFrame, authErrorLogout, token]);

  if (price === -1 || marketData === -1 || cryptoData === -1) {
    return <Unavailable param={cId} theme={theme} />;
  }

  // Blockchain explorer info
  let explorers = [];
  if (cryptoData) {
    cryptoData.links.blockchain_site.slice(0, 3).forEach((link, index) => {
      if (link !== "") {
        const explorer = link.split(".com")[0].split("//")[1];
        const capitalized = explorer[0].toUpperCase() + explorer.slice(1);
        explorers.push(
          <a
            key={link + index}
            className={`crypto-table-val explorer ${
              theme === "light" ? "link-light" : ""
            }`}
            href={link}
            rel="noopener noreferrer"
            target="_blank"
          >
            {capitalized}
          </a>
        );
      }
    });
  }

  // Crypto categories
  let categories = [];
  if (cryptoData) {
    cryptoData.categories.forEach((category, index) => {
      if (category !== "") {
        categories.push(
          <div
            key={category + index}
            className={`crypto-table-val category ${
              theme === "light" ? "link-light" : ""
            }`}
          >
            {category}
          </div>
        );
      }
    });
  }

  console.log(timeFrame);

  return (
    <div
      className={`crypto-page-container ${
        theme === "light" ? "crypto-page-container-light" : null
      }`}
    >
      <div className="company-chart-container">
        <div className="crypto-symbol">
          {cryptoData && cryptoData.image ? (
            <img src={cryptoData.image} alt="crypto" />
          ) : null}
          <h1>{cryptoData ? cryptoData.symbol.toUpperCase() : ""}</h1>
        </div>
        <h1 className="asset-price">${price}</h1>
        <div
          className={`company-asset-change ${
            theme === "light" ? "company-asset-change-light" : null
          } ${priceChangeClass}`}
        >
          <span>
            {priceChange < 0 ? "" : "+"}
            {priceChange ? priceChange.toFixed(2) : ""}%
          </span>
        </div>
        <div className="intervals">
          {/* <div
            onClick={() => {
              setHideX(true);
              setTimeFrame("day");
            }}
          >
            1D
          </div> */}
          <div
            onClick={() => {
              setHideX(true);
              setTimeFrame("week");
            }}
            className={`interval ${
              timeFrame === "week" ? "active-interval" : null
            }`}
          >
            1W
          </div>
          <div
            onClick={() => {
              setHideX(true);
              setTimeFrame("month");
            }}
            className={`interval ${
              timeFrame === "month" ? "active-interval" : null
            }`}
          >
            1M
          </div>
          <div
            onClick={() => {
              setHideX(true);
              setTimeFrame("year");
            }}
            className={`interval ${
              timeFrame === "year" ? "active-interval" : null
            }`}
          >
            1Y
          </div>
        </div>
        <br />
        <Chart
          timeFrame={timeFrame}
          hide={hideX}
          handle={handleHide}
          priceChange={priceChange}
          valueData={marketData}
        />
      </div>
      <div
        className={`crypto-info-container ${
          theme === "light" ? "crypto-info-container-light" : null
        }`}
      >
        <div
          className={`asset-header ${
            theme === "light" ? "asset-header-light" : null
          }`}
        >
          <h2>About</h2>
        </div>
        <div className="company-info-content">
          {expandContent ? (
            <p>
              {cryptoData ? (
                <span
                  dangerouslySetInnerHTML={{ __html: cryptoData.description }}
                />
              ) : (
                ""
              )}
              <span> </span>
              <span
                className="content-expand"
                onClick={() => setExpandContent(false)}
              >
                Read less
              </span>
            </p>
          ) : (
            <p>
              {cryptoData ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: cryptoData.description
                      .split(" ")
                      .slice(0, 80)
                      .join(" "),
                  }}
                ></span>
              ) : (
                ""
              )}
              <span> </span>
              <span
                className="content-expand"
                onClick={() => setExpandContent(true)}
              >
                Read more
              </span>
            </p>
          )}
        </div>
        <div className="crypto-table">
          <div className="info-row market-cap-rank">
            <div className="info-title">Market Cap</div>
            <div className="crypto-table-val">
              Rank #{cryptoData ? cryptoData.marketRank : ""}
            </div>
          </div>
          <div className="info-row website">
            <div className="info-title">Website</div>
            {cryptoData ? (
              <a
                className={`crypto-table-val ${
                  theme === "light" ? "link-light" : ""
                }`}
                href={cryptoData.links.homepage[0]}
                rel="noopener noreferrer"
                target="_blank"
              >
                {cryptoData.links.homepage[0]}
              </a>
            ) : (
              ""
            )}
          </div>
          <div className="info-row explorers">
            <div className="info-title">Explorers</div>
            <div className="explorer-links">{explorers}</div>
          </div>
          <div className="info-row community">
            <div className="info-title">Community</div>
            <div className="community-links">
              {cryptoData &&
              cryptoData.links.twitter_screen_name &&
              cryptoData.links.twitter_screen_name !== "" ? (
                <a
                  className={`crypto-table-val social ${
                    theme === "light" ? "link-light" : ""
                  }`}
                  rel="noopener noreferrer"
                  target="_blank"
                  href={`http://twitter.com/${cryptoData.links.twitter_screen_name}`}
                >
                  Twitter
                </a>
              ) : null}
              {cryptoData &&
              cryptoData.links.facebook_username &&
              cryptoData.links.facebook_username !== "" ? (
                <a
                  className={`crypto-table-val social ${
                    theme === "light" ? "link-light" : ""
                  }`}
                  rel="noopener noreferrer"
                  target="_blank"
                  href={`http://facebook.com/${cryptoData.links.facebook_username}`}
                >
                  Facebook
                </a>
              ) : null}
              {cryptoData &&
              cryptoData.links.telegram_channel_identifier &&
              cryptoData.links.telegram_channel_identifier !== "" ? (
                <a
                  className={`crypto-table-val social ${
                    theme === "light" ? "link-light" : ""
                  }`}
                  rel="noopener noreferrer"
                  target="_blank"
                  href={`https://t.me/${cryptoData.links.telegram_channel_identifier}`}
                >
                  Telegram
                </a>
              ) : null}
              {cryptoData &&
              cryptoData.links.subreddit_url &&
              cryptoData.links.subreddit_url !== "" ? (
                <a
                  className={`crypto-table-val social ${
                    theme === "light" ? "link-light" : ""
                  }`}
                  rel="noopener noreferrer"
                  target="_blank"
                  href={cryptoData.links.subreddit_url}
                >
                  Reddit
                </a>
              ) : null}
            </div>
          </div>
          <div className="info-row crypto-category">
            <div className="info-title">Category</div>
            <div className="categories">{categories}</div>
          </div>
        </div>
      </div>
      {cryptoData ? <CryptoMarket data={cryptoData} /> : null}
      {cryptoData ? <CryptoExchange data={cryptoData} /> : null}
      <CompanyNews newsData={asetNews} />
    </div>
  );
};

export default CryptoPage;
