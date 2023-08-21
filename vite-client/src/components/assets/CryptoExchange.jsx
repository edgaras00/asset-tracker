import { useState, useContext } from "react";
import { AppContext } from "../../context/appContext";
import { numberWithCommas } from "../../utils/utils";

import "./styles/assetInfo.css";

const CryptoExchange = ({ data }) => {
  // Component that renders the crypto exchange information table

  const { theme } = useContext(AppContext);
  const [expand, setExpand] = useState(false);

  // Table rows
  // Each row contains exchange information
  let exchangeData = [];
  if (data && data.exchangeData) {
    data.exchangeData.slice(0, 10).forEach((item, index) => {
      const row = (
        <tr
          className={`exchange-table-row ${
            theme === "light" ? "exchange-table-row-light" : null
          }`}
          key={item.name + index}
        >
          <td className="exchange">
            <a href={item.url} rel="noopener noreferrer" target="_blank">
              {item.name}
            </a>
          </td>
          <td>
            <a href={item.url} rel="noopener noreferrer" target="_blank">
              {`${item.base}/${item.target}`}
            </a>
          </td>
          <td>
            <a href={item.url} rel="noopener noreferrer" target="_blank">
              ${numberWithCommas(item.lastPrice)}
            </a>
          </td>
          <td>
            <a href={item.url} rel="noopener noreferrer" target="_blank">
              ${numberWithCommas(item.volume)}
            </a>
          </td>
        </tr>
      );
      exchangeData.push(row);
    });
  }

  return (
    <div
      className={`asset-info-container ${
        theme === "light" ? "asset-info-container-light" : null
      }`}
    >
      <div
        className={`asset-header ${
          theme === "light" ? "asset-header-light" : null
        }`}
      >
        <h2>Exchange data</h2>
        {expand ? (
          <span onClick={() => setExpand(false)}>Hide</span>
        ) : (
          <span onClick={() => setExpand(true)}>Show</span>
        )}
      </div>
      {expand ? (
        <div className="exchange-table-container">
          <table className="asset-table exchange-table">
            <tbody>
              <tr className="exchange-table-header">
                <td>Exchange</td>
                <td>Pair</td>
                <td>Price</td>
                <td>Volume</td>
              </tr>
              {exchangeData}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default CryptoExchange;
