import { useState } from "react";

import ListItem from "./ListItem";
import SearchAsset from "./SearchAsset";
import useWindowWidth from "../../hooks/useWindowWidth";

import "./styles/portfolioList.css";

const PortfolioList = ({ portfolio, assetType, user, theme, serverError }) => {
  // Component that renders the user's asset list/table

  // Search / add asset modal

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);

  // Sort asset list/table by property
  const [sortCol, setSortCol] = useState("value");
  const [ascending, setAscending] = useState(false);
  const { width } = useWindowWidth();

  const openStockModal = () => setIsStockModalOpen(true);
  const closeStockModal = () => setIsStockModalOpen(false);
  const openCryptoModal = () => setIsCryptoModalOpen(true);
  const closeCryptoModal = () => setIsCryptoModalOpen(false);

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
        <button
          className={assetType === "stock" ? "btn-stock" : "btn-crypto"}
          onClick={assetType === "stock" ? openStockModal : openCryptoModal}
        >
          Add Asset
        </button>
      </div>
      <SearchAsset
        isModalOpen={
          assetType === "stock" ? isStockModalOpen : isCryptoModalOpen
        }
        closeModal={assetType === "stock" ? closeStockModal : closeCryptoModal}
        assetType={assetType}
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
              {width > 420 ? (
                <th
                  className="port-col"
                  onClick={() => handleClick("dayChange", sortCol)}
                >
                  24H
                </th>
              ) : null}

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
