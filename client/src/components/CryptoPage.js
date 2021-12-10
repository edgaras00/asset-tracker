import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import Chart from "./Chart";
import CryptoMarket from "./CryptoMarket";
import CryptoExchange from "./CryptoExchange";
import CompanyNews from "./CompanyNews";
import Unavailable from "./Unavailable";
import { AppContext } from "../context/appContext";
import { numberWithCommas } from "../utils/utils";
import "../styles/cryptoPage.css";
import "../styles/assetInfo.css";

const fetchPriceData = async (cId, timeFrame) => {
  try {
    const url = `/crypto/prices/${cId}?interval=${timeFrame}`;
    const response = await fetch(url);

    if (response.status === 500) {
      throw new Error("Something went wrong. Data unavailable");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.log(error);
    return -1;
  }
};

const getCurrentPrice = async (cId, timeFrame) => {
  try {
    const baseUrl = "/crypto/current/";
    const api = `${cId}?interval=${timeFrame}`;

    const response = await fetch(baseUrl + api);

    if (response.status === 500) {
      throw new Error("Something went wrong. Data is not available");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return -1;
  }
};

const fetchCryptoData = async (cId) => {
  try {
    const metadataUrl = `/crypto/data/${cId}`;
    const metaResponse = await fetch(metadataUrl);

    // Handle server error
    if (metaResponse.status === 500) {
      throw new Error("Something went wrong. Data is not available.");
    }
    const metadata = await metaResponse.json();
    return metadata.data;
  } catch (error) {
    console.log(error);
    return -1;
  }
};

const CryptoPage = () => {
  // Component that displays information about a particular crypto asset

  // Set up component state
  const { theme } = useContext(AppContext);
  // Display price info for different time intervals
  // daily, weekly, monthly, yearly
  const [timeFrame, setTimeFrame] = useState("day");
  const [expandContent, setExpandContent] = useState(false);
  const [cryptoData, setCryptoData] = useState(null);
  const [price, setPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [hideX, setHideX] = useState(false);
  const handleHide = () => setHideX(false);
  const { cId } = useParams();

  const priceChangeClass = priceChange && priceChange < 0 ? "percent-dec" : "";

  useEffect(() => {
    const getCryptoInfo = async (cId) => {
      const cryptoData = await fetchCryptoData(cId);
      setCryptoData(cryptoData);
    };
    getCryptoInfo(cId);
  }, [cId]);

  useEffect(() => {
    const fetchMarketData = async (cId, timeFrame) => {
      const cryptoMarketData = await fetchPriceData(cId, timeFrame);
      const priceData = await getCurrentPrice(cId, timeFrame);
      if (priceData !== -1 && cryptoMarketData !== -1) {
        let assetPrice = priceData.data[cId].usd;
        if (assetPrice >= 1000) {
          assetPrice = numberWithCommas(priceData.data[cId].usd);
        }
        const percentChange =
          timeFrame === "day"
            ? priceData.data[cId].usd_24h_change
            : priceData.data.percentChange;
        setMarketData(cryptoMarketData.assetValue);
        setPriceChange(percentChange);
        setPrice(assetPrice);
      }
    };
    fetchMarketData(cId, timeFrame);
  }, [cId, timeFrame]);

  if (price === -1 || marketData === -1 || cryptoData === -1) {
    return <Unavailable param={cId} theme={theme} />;
  }

  // Blockchain explorer info
  let explorers = [];
  if (cryptoData) {
    cryptoData.links.blockchain_site.forEach((link, index) => {
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
            <div>Market Cap</div>
            <div className="crypto-table-val">
              Rank #{cryptoData ? cryptoData.marketRank : ""}
            </div>
          </div>
          <div className="info-row website">
            <div>Website</div>
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
            <div>Explorers</div>
            <div className="info-row explorer-links">{explorers}</div>
          </div>
          <div className="info-row community">
            <div>Community</div>
            <div className="info-row community-links">
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
            <div>Category</div>
            <div className="info-row categories">{categories}</div>
          </div>
        </div>
      </div>
      {cryptoData ? <CryptoMarket data={cryptoData} /> : null}
      {cryptoData ? <CryptoExchange data={cryptoData} /> : null}
      <CompanyNews />
    </div>
  );
};

export default CryptoPage;
