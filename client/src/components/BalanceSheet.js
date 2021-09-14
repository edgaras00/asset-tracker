import React, { useState, useContext } from "react";
import { ThemeContext } from "../context/themeContext";
import { numberWithCommas } from "../utils/utils";
import "../styles/assetInfo.css";

const BalanceSheet = ({ balance }) => {
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
        <h2>Balance Sheet</h2>
        {expand ? (
          <span onClick={() => setExpand(false)}>Hide</span>
        ) : (
          <span onClick={() => setExpand(true)}>Show</span>
        )}
      </div>
      <br />
      {expand ? (
        <div className="table-container">
          <h3>Assets</h3>
          <table className="asset-table">
            <tbody>
              <tr>
                <td>
                  <div className="asset-title">Total Assets</div>
                  <div>{numberWithCommas(balance.assets.totalAssets)}</div>
                </td>
                <td>
                  <div className="asset-title">Current Assets</div>
                  <div>{numberWithCommas(balance.assets.currentAssets)}</div>
                </td>
                <td>
                  <div className="asset-title">Non-Current Assets</div>
                  <div>{numberWithCommas(balance.assets.nonCurrentAssets)}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="asset-title">Cash and Cash equiv.</div>
                  <div>{numberWithCommas(balance.assets.cash)}</div>
                </td>
                <td>
                  <div className="asset-title">Net Receivables</div>
                  <div>{numberWithCommas(balance.assets.netReceivables)}</div>
                </td>
                <td>
                  <div className="asset-title">Inventory</div>
                  <div>{numberWithCommas(balance.assets.inventory)}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="asset-title">Property/Equipment</div>
                  <div>{numberWithCommas(balance.assets.property)}</div>
                </td>
                <td>
                  <div className="asset-title">Depreciation/Amortization</div>
                  <div>{numberWithCommas(balance.assets.depAmm)}</div>
                </td>
                <td>
                  <div className="asset-title">Goodwill</div>
                  <div>{numberWithCommas(balance.assets.goodwill)}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="asset-title">Investments</div>
                  <div>{numberWithCommas(balance.assets.investments)}</div>
                </td>
                <td>
                  <div className="asset-title">Short term investments</div>
                  <div>
                    {numberWithCommas(balance.assets.shortTermInvestments)}
                  </div>
                </td>
                <td>
                  <div className="asset-title">Long term investments</div>
                  <div>
                    {numberWithCommas(balance.assets.longTermInvestments)}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="asset-title">Intangible Assets</div>
                  <div>{numberWithCommas(balance.assets.intangibleAssets)}</div>
                </td>
              </tr>
            </tbody>
          </table>
          <br />
          <h3>Liabilities</h3>
          <table className="asset-table">
            <tbody>
              <tr>
                <td>
                  <div className="asset-title">Total Liabilities</div>
                  <div>
                    {numberWithCommas(balance.liabilities.totalLiabilities)}
                  </div>
                </td>
                <td>
                  <div className="asset-title">Current Liabilities</div>
                  <div>
                    {numberWithCommas(balance.liabilities.currentLiabilities)}
                  </div>
                </td>
                <td>
                  <div className="asset-title">Non-Current Liabilities</div>
                  <div>
                    {numberWithCommas(
                      balance.liabilities.nonCurrentLiabilities
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="asset-title">Current Debt</div>
                  <div>{numberWithCommas(balance.liabilities.currentDebt)}</div>
                </td>
                <td>
                  <div className="asset-title">Short Term Debt</div>
                  <div>
                    {numberWithCommas(balance.liabilities.shortTermDebt)}
                  </div>
                </td>
                <td>
                  <div className="asset-title">Long Term Debt</div>
                  <div>
                    {numberWithCommas(balance.liabilities.longTermDebt)}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="asset-title">Accounts Payable</div>
                  <div>
                    {numberWithCommas(balance.liabilities.accountsPayable)}
                  </div>
                </td>
                <td>
                  <div className="asset-title">Deferred Revenue</div>
                  <div>
                    {numberWithCommas(balance.liabilities.deferredRevenue)}
                  </div>
                </td>
                <td>
                  <div className="asset-title">Capital Lease Obligations</div>
                  <div>
                    {numberWithCommas(
                      balance.liabilities.capitalLeaseObligations
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <br />
          <h3>Shareholder Equity</h3>
          <table className="asset-table">
            <tbody>
              <tr>
                <td>
                  <div className="asset--title">Total Equity</div>
                  <div>
                    {numberWithCommas(balance.shareHolderEquity.totalEquity)}
                  </div>
                </td>
                <td>
                  <div className="asset-title">Treasury Stock</div>
                  <div>
                    {numberWithCommas(balance.shareHolderEquity.treasuryStock)}
                  </div>
                </td>
                <td>
                  <div className="asset-title">Common stock</div>
                  <div>
                    {numberWithCommas(balance.shareHolderEquity.commonStock)}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="asset-title">Retained Earnings</div>
                  <div>
                    {numberWithCommas(
                      balance.shareHolderEquity.retainedEarnings
                    )}
                  </div>
                </td>
                <td>
                  <div className="asset-title">Common Stock SO</div>
                  <div>
                    {numberWithCommas(balance.shareHolderEquity.commonStockSO)}
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

export default BalanceSheet;
