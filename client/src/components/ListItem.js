import React, { useState } from "react";
import { Link } from "react-router-dom";
import RemoveTxn from "./RemoveTxn";
import { numberWithCommas } from "../utils/utils";
import "../styles/listItem.css";

const ListItem = ({
  cid,
  type,
  ticker,
  logo,
  amount,
  price,
  value,
  dayChange,
  returnOnInvestment,
  name,
  theme,
  assetID,
}) => {
  // Component for user's portfolio table rows

  // Remove / sell asset modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <tr className="row">
      <RemoveTxn
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        symbol={ticker}
        assetObjectId={assetID}
        type={type}
        name={name}
        totalAmount={amount}
        cid={cid}
        assetPrice={price}
      />
      <td className="table-ticker">
        <Link to={type === "stocks" ? `/company/${ticker}` : `/crypto/${cid}`}>
          <img src={logo} alt="symbol" />
          <span className={theme === "light" ? "ticker-light" : "ticker"}>
            {ticker}
          </span>
        </Link>
      </td>
      {amount ? <td>{numberWithCommas(amount)}</td> : null}
      <td>${price >= 1000 ? numberWithCommas(price) : price}</td>
      {value ? <td>${numberWithCommas(value.toFixed(2))}</td> : null}
      <td
        className={dayChange >= 0 ? "percent-change-inc" : "percent-change-dec"}
      >
        {dayChange > 0 ? "+" : null}
        {dayChange}%
      </td>
      {returnOnInvestment ? (
        <td
          className={`roi-col ${
            returnOnInvestment >= 0
              ? "percent-change-inc"
              : "percent-change-dec"
          }`}
        >
          {returnOnInvestment >= 0 ? "+" : null}
          {returnOnInvestment}%
        </td>
      ) : null}
      <td className="last-col remove" onClick={openModal}>
        Remove
      </td>
    </tr>
  );
};

export default ListItem;
