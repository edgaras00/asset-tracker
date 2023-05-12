import { multiplyArrayContents, getExchangeImages } from "../../utils/utils";

// Images
import stockImage from "../../images/stock.jpg";
import candleImage from "../../images/candle.jpg";

import lseImage from "../../images/lse.png";
import nasdaqImage from "../../images/nasdaq.png";
import nyseImage from "../../images/nyse.png";
import jpxImage from "../../images/jpx.png";
import hkexImage from "../../images/hkex.png";

import "../../styles/assetHome.css";

const StocksHome = () => {
  const stockExchanges = [
    lseImage,
    nasdaqImage,
    nyseImage,
    jpxImage,
    hkexImage,
  ];

  const stockExchangeImages = getExchangeImages(stockExchanges);
  const multipliedExchanges = multiplyArrayContents(stockExchangeImages, 3);

  return (
    <div className="intro-home-wrapper">
      <div className="asset-intro-container">
        <div className="intro-text">
          <h1>The best tracker for stocks</h1>
        </div>
        <img className="stock-intro" src={stockImage} alt="stocks" />
      </div>
      <br />
      <div className="asset-description">
        <img src={candleImage} alt="candlesticks" />
        <div className="asset-description-text">
          <h2>Take control over your stock portfolio</h2>
          <p>
            Keep track of all stocks spanning global markets such as Nasdaq,
            NYSE, IEX and more. Use the app to get the latest stocks prices and
            market charts to make sure you don't miss your next stock
            investment.
          </p>
        </div>
      </div>
      <br />
      <div className="exchange-container">
        <h3>Stock tracker with support for various exchanges</h3>
        <div className="exchanges stock-ex">{multipliedExchanges}</div>
      </div>
    </div>
  );
};

export default StocksHome;
