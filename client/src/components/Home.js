import React, { useState } from "react";
import { Link } from "react-router-dom";
import Typewriter from "typewriter-effect";
import "../styles/home.css";

const Home = () => {
  // Homepage component

  const [typewriterClass, setTypewriterClass] = useState("typewriter-start");

  return (
    <div className="home-container">
      <div className="assets-wrapper">
        <div className="assets-symbols"></div>
        <div className="gradient-overlay"></div>
      </div>
      <div className="home-content">
        <div className="home-text-container">
          <h1>Alpha</h1>
          <div className={typewriterClass}>
            <Typewriter
              id="type"
              onInit={(typewriter) => {
                typewriter
                  .typeString("Crypto")
                  .pauseFor(2000)
                  .deleteAll()
                  .typeString("Stocks")
                  .pauseFor(2000)
                  .deleteAll()
                  .typeString("ETFs")
                  .pauseFor(2000)
                  .deleteAll()
                  .callFunction(() => setTypewriterClass("typewriter-end"))
                  .typeString("Investment")
                  .start();
              }}
            />
          </div>
          <h1>Tracker</h1>
          <br />
          <h3>
            Powered by:{" "}
            <a
              className="source"
              href="https://iexcloud.io/"
              target="_blank"
              rel="noopener noreferrer"
            >
              IEX
            </a>{" "}
            <a
              className="source"
              href="https://coingecko.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              COINGECKO
            </a>{" "}
            <a
              className="source"
              href="https://www.alphavantage.co/"
              target="_blank"
              rel="noopener noreferrer"
            >
              ALPHA VANTAGE
            </a>
          </h3>
        </div>
        <span className="subtitle">One app to track all your investments.</span>
        <div className="button-container">
          <Link to="/signup">
            <div className="home-buttons">
              <span>Sign up</span>
            </div>
          </Link>
          <Link to="/login">
            <div className="home-buttons">
              <span>Log in</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
