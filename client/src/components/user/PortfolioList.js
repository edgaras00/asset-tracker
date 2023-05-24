import { useState } from "react";

import ListItem from "./ListItem";
import SearchModal from "./SearchModal";

import "./styles/portfolioList.css";

const PortfolioList = ({ portfolio, assetType, user, theme, serverError }) => {
  // Component that renders the user's asset list/table

  // Search / add asset modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sort asset list/table by property
  // value, price, amount, 24H price change, ROI
  const [sortCol, setSortCol] = useState("value");
  // Sort by ascending or descending values
  const [ascending, setAscending] = useState(false);

  // Functions that open/close asset search modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Button class for different theme and asset type classes
  let btnClass = "btn-stock";
  if (assetType === "stock" && theme !== "light") {
    btnClass = "btn-stock";
  } else if (assetType === "stock" && theme === "light") {
    btnClass = "btn-stock-light";
  } else if (assetType === "crypto" && theme !== "light") {
    btnClass = "btn-crypto";
  } else {
    btnClass = "btn-crypto-light";
  }

  const handleClick = (column, currentCol) => {
    // Function that sorts portfolio by selected column values
    if (column === currentCol) {
      setAscending((prev) => !prev);
      return;
    }
    setSortCol(column);
    setAscending(false);
    return;
  };

  // Sorted portfolio
  let sortedPortfolio = [];
  if (portfolio) {
    sortedPortfolio = [...portfolio].sort((a, b) => {
      if (ascending) {
        return parseFloat(a[sortCol]) - parseFloat(b[sortCol]);
      } else {
        return parseFloat(b[sortCol]) - parseFloat(a[sortCol]);
      }
    });
  }

  // Set up portfolio table rows for each asset
  let rows = [];
  if (portfolio) {
    rows = sortedPortfolio.map((item, index) => (
      <ListItem
        key={index + item.amount + item.value}
        cid={item.cid}
        type={assetType}
        ticker={item.symbol}
        logo={item.logo}
        amount={item.amount}
        price={item.price}
        value={item.value}
        dayChange={item.dayPercentChange}
        returnOnInvestment={item.returnOnInvestment}
        name={item.name}
        theme={theme}
        assetID={item.id}
      />
    ));
  }

  return (
    <div
      className={`port-wrapper ${
        theme === "light" ? "port-wrapper-light" : null
      }`}
    >
      <div
        className={`port-header ${
          theme === "light" ? "port-header-light" : null
        }`}
      >
        <h2>{assetType === "stock" ? "Stock" : "Crypto"} Portfolio</h2>
        <button className={btnClass} onClick={openModal}>
          Add Asset
        </button>
      </div>
      <SearchModal
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        user={user}
        txnType="buy"
      />
      {portfolio.length > 0 ? (
        <table
          className={`port-table ${
            theme === "light" ? "port-table-light" : null
          }`}
        >
          <thead>
            <tr>
              <th></th>
              <th
                className="port-col"
                onClick={() => handleClick("amount", sortCol)}
              >
                Amount
              </th>
              <th
                className="port-col"
                onClick={() => handleClick("price", sortCol)}
              >
                Price
              </th>
              <th
                className="port-col"
                onClick={() => handleClick("value", sortCol)}
              >
                Value
              </th>
              <th
                className="port-col"
                onClick={() => handleClick("dayChange", sortCol)}
              >
                24H
              </th>

              <th
                className="roi-col port-col"
                onClick={() => handleClick("roi", sortCol)}
              >
                ROI
              </th>
              <th className="last-col"></th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      ) : (
        <span className="no-assets">
          {serverError ? (
            <span className="no-assets">
              Something went wrong. Could not get data. Please try again later
            </span>
          ) : (
            <span>
              <h2>
                You do not own any {assetType === "stock" ? "stocks" : "crypto"}
              </h2>
              <h2>Click "Add Asset" to add a new asset</h2>
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default PortfolioList;
