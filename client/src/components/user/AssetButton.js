import "../../styles/assetButton.css";

const AssetButton = ({ type, onClick, theme }) => {
  let buttonClass;
  if (type === "stock") {
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
      onClick={() => onClick(type)}
    >
      {type}
    </button>
  );
};

AssetButton.defaultProps = {
  type: "stocks",
  theme: "dark",
};

export default AssetButton;
