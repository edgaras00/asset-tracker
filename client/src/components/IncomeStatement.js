import React, { useState, useContext } from "react";
import { ThemeContext } from "../context/themeContext";
import {numberWithCommas} from '../utils/utils';
import "../styles/assetInfo.css";

const IncomeStatement = ({ income }) => {
  const { theme } = useContext(ThemeContext);
  const [expand, setExpand] = useState(false);

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
        <h2>Income Statement</h2>
        {expand ? (
          <span onClick={() => setExpand(false)}>Hide</span>
        ) : (
          <span onClick={() => setExpand(true)}>Show</span>
        )}
      </div>
      {expand ? (
        <div className="income-table-container">
          <h3>Revenue</h3>
          <table className="asset-table">
            <tbody>
              <tr>
                <td>
                  <div className="asset-title">Total Revenue</div>
                  <div>{numberWithCommas(income.totalRevenue)}</div>
                </td>
                <td>
                  <div className="asset-title">Cost of Revenue</div>
                  <div>{numberWithCommas(income.costOfRevenue)}</div>
                </td>
                <td>
                  <div className="asset-title">Gross Profits</div>
                  <div>{numberWithCommas(income.grossProfit)}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="asset-title">Operating Expenses</div>
                  <div>{numberWithCommas(income.operatingExpenses)}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default IncomeStatement;
