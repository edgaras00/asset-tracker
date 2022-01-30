import React from "react";
import "../styles/assetButton.css";

const AssetButton = ({ type, handleClick, theme }) => {
  let buttonClass;
  if (type === "stocks") {
    buttonClass = `stock-button ${
      theme === "light" ? "stock-btn-light" : null
    }`;
  } else {
    buttonClass = `crypto-button ${
      theme === "light" ? "crypto-btn-light" : null
    }`;
  }

  return (
    <button
      className={`select-asset-button ${buttonClass}`}
      onClick={() => handleClick(type)}
    >
      {type}
    </button>
  );
};

export default AssetButton;
