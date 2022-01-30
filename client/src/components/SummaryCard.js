import React from "react";
import "../styles/summaryCell.css";

const SummaryCard = ({ header, value, theme, type, increasing }) => {
  const colorClassInc = theme === "light" ? "percent-inc-light" : "percent-inc";

  let percentClass;
  if (type === "percent" && increasing !== null) {
    percentClass = increasing ? colorClassInc : "percent-change-dec";
  }
  return (
    <div
      className={`summary-cell ${
        theme === "light" ? "summary-cell-light" : ""
      }`}
    >
      <h3>{header}</h3>
      <h2 className={percentClass}>
        {type === "usd" ? "$" : null}
        {value}
        {type === "percent" ? "%" : null}
      </h2>
    </div>
  );
};

export default SummaryCard;
