import React, { useState, useContext } from "react";
import { AppContext } from "../context/appContext";
import { numberWithCommas } from "../utils/utils";
import "../styles/assetInfo.css";

const CryptoMarket = ({ data }) => {
  // Market data component

  const { theme } = useContext(AppContext);
  const [expand, setExpand] = useState(true);

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
        <h2>Market data</h2>
        {expand ? (
          <span onClick={() => setExpand(false)}>Hide</span>
        ) : (
          <span onClick={() => setExpand(true)}>Show</span>
        )}
      </div>
      {expand ? (
        <div className="crypto-market-table-container">
          <table className="asset-table market-table">
            <tbody>
              <tr>
                <td>
                  <div className="asset-title">Marketcap</div>
                  <div>
                    {data.marketcap ? numberWithCommas(data.marketcap) : ""}
                  </div>
                </td>
                <td>
                  <div className="asset-title">Total Supply</div>
                  <div>
                    {data.totalSupply ? numberWithCommas(data.totalSupply) : ""}
                  </div>
                </td>
                <td>
                  <div className="asset-title">Max Supply</div>
                  <div>
                    {data.maxSupply ? numberWithCommas(data.maxSupply) : ""}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="asset-title">Circulating Supply</div>
                  <div>
                    {data.circulatingSupply
                      ? numberWithCommas(data.circulatingSupply)
                      : ""}
                  </div>
                </td>
                <td>
                  <div className="asset-title">Fully Diluted Valuation</div>
                  <div>{data.fdv ? numberWithCommas(data.fdv) : ""}</div>
                </td>
                <td>
                  <div className="asset-title">24H High</div>
                  <div>
                    {data.high24h ? numberWithCommas(data.high24h) : ""}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="asset-title">24H Low</div>
                  <div>{data.low24h ? numberWithCommas(data.low24h) : ""}</div>
                </td>
                <td>
                  <div className="asset-title">ATH</div>
                  <div>{data.ath ? numberWithCommas(data.ath) : ""}</div>
                </td>
                <td>
                  <div className="asset-title">Total Volume</div>
                  <div>
                    {data.totalVolume ? numberWithCommas(data.totalVolume) : ""}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default CryptoMarket;
