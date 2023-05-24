import React, { useState, useContext } from "react";
import { AppContext } from "../../context/appContext";
import { numberWithCommas } from "../../utils/utils";

import "./styles/assetInfo.css";

const CashFlow = ({ cash }) => {
  // Component for company's cash flow data
  const { theme } = useContext(AppContext);
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
        <h2>Cash Flow Statement</h2>
        {expand ? (
          <span onClick={() => setExpand(false)}>Hide</span>
        ) : (
          <span onClick={() => setExpand(true)}>Show</span>
        )}
      </div>
      {expand ? (
        <div className="table-container">
          <h3>Operations</h3>
          <table className="asset-table">
            <tbody>
              <tr>
                <td>
                  <div className="asset-title">Operating Cashflow</div>
                  <div>
                    {numberWithCommas(cash.operations.operatingCashFlow)}
                  </div>
                </td>
                <td>
                  <div className="asset-title">
                    Operating Activities Payments
                  </div>
                  <div>
                    {numberWithCommas(cash.operations.opActivitiesPayments)}
                  </div>
                </td>
                <td>
                  <div className="asset-title">
                    Operating Activities Proceeds
                  </div>
                  <div>
                    {numberWithCommas(cash.operations.opActivitiesProceeds)}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="asset-title">
                    Change in Operating Liabilities
                  </div>
                  <div>{numberWithCommas(cash.operations.opLiabilities)}</div>
                </td>
                <td>
                  <div className="asset-title">Change in Operating Assets</div>
                  <div>{numberWithCommas(cash.operations.opAssets)}</div>
                </td>
              </tr>
            </tbody>
          </table>
          <br />
          <h3>Investing</h3>
          <table className="asset-table">
            <tbody>
              <tr>
                <td>
                  <div className="asset-title">Cash Flow from Investment</div>
                  <div>{numberWithCommas(cash.investing.investmentCash)}</div>
                </td>
                <td>
                  <div className="asset-title">Change in Inventory</div>
                  <div>{numberWithCommas(cash.investing.inventory)}</div>
                </td>
                <td>
                  <div className="asset-title">Capital Expenditures</div>
                  <div>
                    {numberWithCommas(cash.investing.capitalExpenditures)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <br />
          <h3>Financing</h3>
          <table className="asset-table">
            <tbody>
              <tr>
                <td>
                  <div className="asset-title">Cash Flow from Financing</div>
                  <div>{numberWithCommas(cash.financing.financingCash)}</div>
                </td>
                <td>
                  <div className="asset-title">Short Term Debt Repayment</div>
                  <div>{numberWithCommas(cash.financing.shortDebtRp)}</div>
                </td>
                <td>
                  <div className="asset-title">Common Stock Repurchase</div>
                  <div>{numberWithCommas(cash.financing.cStockRp)}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="asset-title">Equity Repurchase</div>
                  <div>
                    {numberWithCommas(cash.financing.repurchaseEquityProceeds)}
                  </div>
                </td>
                <td>
                  <div className="asset-title">Dividend Payout</div>
                  <div>{numberWithCommas(cash.financing.dividendPayout)}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default CashFlow;
