import { multiplyArrayContents, getExchangeImages } from "../../utils/utils";

// Images
import cryptoImage from "../../images/crypto.jpg";
import btcImage from "../../images/btc.jpg";

import coinbaseImage from "../../images/coinbase.png";
import binanceImage from "../../images/binance.png";
import krakenImage from "../../images/kraken.png";
import kucoinImage from "../../images/kucoin.png";
import bitfinexImage from "../../images/bitfinex.png";
import geminiImage from "../../images/gemini.png";

import "../../styles/assetHome.css";

const CryptoHome = () => {
  const cryptoExchanges = [
    coinbaseImage,
    binanceImage,
    krakenImage,
    kucoinImage,
    bitfinexImage,
    geminiImage,
  ];
  const cryptoExchangeImages = getExchangeImages(cryptoExchanges);
  const multipliedExchanges = multiplyArrayContents(cryptoExchangeImages, 4);

  return (
    <div className="intro-home-wrapper">
      <div className="asset-intro-container">
        <div className="intro-text">
          <h1>The best crypto tracker for Bitcoin and other crypto</h1>
        </div>
        <img src={cryptoImage} alt="crypto" />
      </div>
      <br />
      <div className="asset-description">
        <img src={btcImage} alt="crypto" />
        <div className="asset-description-text">
          <h2>Take control over your cryptocurrency portfolio</h2>
          <p>
            Keep track of all crypto coins, including Bitcoin, Ethereum, and
            other altcoins. Use the app to get the latest coin prices and market
            charts to make sure you don't miss out on your next crypto
            investment.
          </p>
        </div>
        <br />
      </div>
      <div className="exchange-container">
        <h3>Crypto tracker with support for various exchanges</h3>
        <div className="exchanges">{multipliedExchanges}</div>
      </div>
    </div>
  );
};

export default CryptoHome;
