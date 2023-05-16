import { useState, useContext } from "react";
import { AppContext } from "../../context/appContext";
import { numberWithCommas } from "../../utils/utils";

import "./styles/assetInfo.css";

const CompanyInfo = ({ overview }) => {
  // Company info component
  const { theme } = useContext(AppContext);
  const [expandContent, setExpandContent] = useState(false);
  const [expandOverview, setExpandOverview] = useState(false);

  const moreRows = [
    <tr key="row1">
      <td>
        <div className="asset-title">EPS</div>
        <div>{overview.eps ? overview.eps : ""}</div>
      </td>
      <td>
        <div className="asset-title">ROE</div>
        <div>{overview.roe}</div>
      </td>
      <td>
        <div className="asset-title">Profit Margin</div>
        <div>{overview.profitMargin}</div>
      </td>
    </tr>,
    <tr key="row2">
      <td>
        <div className="asset-title">P/E</div>
        <div>{overview.pe}</div>
      </td>
      <td>
        <div className="asset-title">PEG</div>
        <div>{overview.peg}</div>
      </td>
      <td>
        <div className="asset-title">P/B</div>
        <div>{overview.pb}</div>
      </td>
    </tr>,
  ];

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
        <h2>About</h2>
        {expandOverview ? (
          <span onClick={() => setExpandOverview(false)}>Show less</span>
        ) : (
          <span onClick={() => setExpandOverview(true)}>Show more</span>
        )}
      </div>
      <div className="company-info-content">
        {expandContent ? (
          <p>
            {overview.description}
            <span> </span>
            <span
              className="content-expand"
              onClick={() => setExpandContent(false)}
            >
              Read less
            </span>
          </p>
        ) : (
          <p>
            {overview
              ? overview.description.split(" ").slice(0, 80).join(" ")
              : null}
            <span> </span>
            <span
              className="content-expand"
              onClick={() => setExpandContent(true)}
            >
              Read more
            </span>
          </p>
        )}
        <br />
        <table className="asset-table">
          <tbody>
            <tr>
              <td>
                <div className="asset-title">Sector</div>
                <div>{overview.sector}</div>
              </td>
              <td>
                <div className="asset-title">Industry</div>
                <div>{overview.industry}</div>
              </td>
              <td>
                <div className="asset-title">Country</div>
                <div>{overview.country}</div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="asset-title">Marketcap</div>
                <div>{numberWithCommas(overview.marketcap)}</div>
              </td>
              <td>
                <div className="asset-title">Exchange</div>
                <div>{overview.exchange}</div>
              </td>
              <td>
                <div className="asset-title">Employees</div>
                <div>
                  {overview.employees
                    ? numberWithCommas(overview.employees)
                    : "No data"}
                </div>
              </td>
            </tr>
            {expandOverview ? moreRows : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyInfo;
