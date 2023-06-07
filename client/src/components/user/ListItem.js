import { useState } from "react";
import { Link } from "react-router-dom";

import RemoveTxn from "./RemoveTxn";

import { numberWithCommas } from "../../utils/utils";
import useWindowWidth from "../../hooks/useWindowWidth";

import "./styles/listItem.css";
import "./styles/valueColors.css";

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
  const { width } = useWindowWidth();
  console.log(returnOnInvestment);

  // Booleans for classes and links

  let tickerClass = "table-ticker";
  // Fix GOOGLE logo
  if (ticker === "GOOGL") {
    tickerClass = "table-ticker google";
  }

  console.log(returnOnInvestment);

  // Link to stock or crypto
  const destination =
    type === "stock" ? `/company/${ticker}` : `/crypto/${cid}`;

  // Ticker class
  const tickerThemeClass = theme === "light" ? "ticker-light" : "ticker";

  // Display price
  const displayPrice =
    price >= 1000
      ? numberWithCommas(parseFloat(price.toFixed(2)))
      : price.toFixed(2);

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
      <td className={tickerClass}>
        <Link to={destination}>
          <img src={logo} alt="symbol" />
          <span className={tickerThemeClass}>
            {width > 420 ? ticker : null}
          </span>
        </Link>
      </td>
      {amount ? <td>{numberWithCommas(amount)}</td> : null}
      <td>${displayPrice}</td>
      {value ? <td>${numberWithCommas(value.toFixed(2))}</td> : null}
      {width > 420 ? (
        <td className={dayChange >= 0 ? "value-increase" : "value-decrease"}>
          {dayChange > 0 ? "+" : null}
          {dayChange}%
        </td>
      ) : null}

      {returnOnInvestment !== null ? (
        <td
          className={`roi-col ${
            returnOnInvestment >= 0 ? "value-increase" : "value-decrease"
          }`}
        >
          {returnOnInvestment >= 0 ? "+" : ""}
          {returnOnInvestment}%
        </td>
      ) : (
        0
      )}
      <td className="remove" onClick={openModal}>
        {width > 420 ? "Remove" : "X"}
      </td>
    </tr>
  );
};

export default ListItem;
