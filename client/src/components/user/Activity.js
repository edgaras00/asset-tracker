import ActivityRow from "./ActivityRow";

import "../../styles/activity.css";

const Activity = ({ assetType, theme, transactionHistory }) => {
  // Component that renders user's transaction activity data

  // Sort array by dates (descending)
  transactionHistory.sort((a, b) => {
    return (
      new Date(b.date) - new Date(a.date) || b.savedTimestamp - a.savedTimestamp
    );
  });

  const activityRows = transactionHistory.map((activity, index) => (
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
      {transactionHistory.length > 0 ? (
        <table
          className={`activity-table ${
            theme === "light" ? "activity-table-light" : null
          }`}
        >
          <tbody>{activityRows}</tbody>
        </table>
      ) : (
        <div className="no-activity">
          <h2>No {assetType} transaction activity</h2>
        </div>
      )}
    </div>
  );
};

export default Activity;
