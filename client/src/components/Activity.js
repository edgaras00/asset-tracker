import React from "react";
import ActivityRow from "./ActivityRow";
import "../styles/activity.css";

const Activity = ({ txnHistory, assetType, theme }) => {
  // Component that renders user's transaction activity data

  let history = [];
  if (assetType === "stocks") {
    history = txnHistory["stocks"];
  } else {
    history = txnHistory["crypto"];
  }

  const noActivity = assetType === 'stocks'? 'stock' : 'crypto';

  const activityRows = history.map((activity, index) => (
    <ActivityRow
      key={activity.symbol + index + activity.price}
      action={activity.action}
      date={activity.date}
      amount={activity.amount}
      price={activity.price}
      symbol={activity.symbol}
    />
  ));

  return (
    <div
      className={`activity-container ${
        theme === "light" ? "activity-container-light" : null
      }`}
    >
      {history.length > 0 ? (
        <table
          className={`activity-table ${
            theme === "light" ? "activity-table-light" : null
          }`}
        >
          <tbody>{activityRows}</tbody>
        </table>
      ) : (
        <div className='no-activity'>
          <h2>No {noActivity} transaction activity</h2>
        </div>
      )}
    </div>
  );
};

export default Activity;
