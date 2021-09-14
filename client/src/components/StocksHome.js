import React from 'react';
import '../styles/assetHome.css';
import stocks from '../img/stock5.jpg';
import candle from '../img/candle2.jpg';
import lse from '../img/lse.png';
import nasdaq from '../img/nasdaq.png';
import nyse from '../img/nyse.png';
import jpx from '../img/jpx.png';
import hkex from '../img/hkex.png';

const StocksHome = () => {
    return (
      <div className="intro-home-wrapper">
        <div className="asset-intro-container">
          <div className="intro-text">
            <h1>The best tracker for stocks</h1>
          </div>
          <img src={stocks} alt="stocks" />
        </div>
        <br />
        <div className="asset-description">
          <img src={candle} alt="candlesticks" />
          <div className="asset-description-text">
            <h2>Take control over your stock portfolio</h2>
            <p>
              Keep track of all stocks spanning global markets such as Nasdaq,
              NYSE, IEX and more. Use the app to get the latest stocks prices
              and market charts to make sure you don't miss your next stock
              investment.
            </p>
          </div>
        </div>
        <br />
        <div className="exchange-container">
          <h1>Stock tracker with support for various exchanges</h1>
          <div className="exchanges stock-ex">
            <img src={nasdaq} alt="exchange" />
            <img src={nyse} alt="exchange" />
            <img src={lse} alt="exchange" />
            <img src={hkex} alt="exchange" />
            <img src={jpx} alt="exchange" />
            <img src={nasdaq} alt="exchange" />
            <img src={nyse} alt="exchange" />
            <img src={lse} alt="exchange" />
            <img src={hkex} alt="exchange" />
            <img src={jpx} alt="exchange" />
            <img src={nasdaq} alt="exchange" />
            <img src={nyse} alt="exchange" />
            <img src={lse} alt="exchange" />
            <img src={hkex} alt="exchange" />
            <img src={jpx} alt="exchange" />
          </div>
        </div>
      </div>
    );
}

export default StocksHome;