import React from "react";
import "../styles/assetHome.css";
import btcImg from "../img/crypto-3.jpg";
import cryptoImage from "../img/crypto-4.jpg";
import coinbase from "../img/coinbase.png";
import binance from "../img/binance.png";
import kraken from "../img/kraken.png";
import kucoin from "../img/kucoin.png";
import bitfinex from "../img/bitfinex.png";
import etoro from "../img/etoro.png";
import gemini from "../img/gemini.png";

const CryptoHome = () => {
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
        <img src={btcImg} alt="crypto" />
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
        <div className="exchanges">
          <img src={coinbase} alt="exchange" />
          <img src={binance} alt="exchange" />
          <img src={kraken} alt="exchange" />
          <img src={kucoin} alt="exchange" />
          <img src={etoro} alt="exchange" />
          <img src={bitfinex} alt="exchange" />
          <img src={gemini} alt="exchange" />
          <img src={coinbase} alt="exchange" />
          <img src={binance} alt="exchange" />
          <img src={kraken} alt="exchange" />
          <img src={kucoin} alt="exchange" />
          <img src={etoro} alt="exchange" />
          <img src={bitfinex} alt="exchange" />
          <img src={gemini} alt="exchange" />
          <img src={coinbase} alt="exchange" />
          <img src={binance} alt="exchange" />
          <img src={kraken} alt="exchange" />
          <img src={kucoin} alt="exchange" />
          <img src={etoro} alt="exchange" />
          <img src={bitfinex} alt="exchange" />
          <img src={gemini} alt="exchange" />
          <img src={coinbase} alt="exchange" />
          <img src={binance} alt="exchange" />
          <img src={kraken} alt="exchange" />
          <img src={kucoin} alt="exchange" />
          <img src={etoro} alt="exchange" />
          <img src={bitfinex} alt="exchange" />
          <img src={gemini} alt="exchange" />
        </div>
      </div>
    </div>
  );
};

export default CryptoHome;
