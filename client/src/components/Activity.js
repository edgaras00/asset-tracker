import ActivityRow from "./ActivityRow";
import "../styles/activity.css";

const Activity = ({ assetType, theme, txnHistory }) => {
  // Component that renders user's transaction activity data

  const noActivity = assetType === "stocks" ? "stock" : "crypto";

  // Sort array by dates (descending)
  txnHistory.sort((a, b) => {
    return (
      new Date(b.date) - new Date(a.date) || b.savedTimestamp - a.savedTimestamp
    );
  });

  const activityRows = txnHistory.map((activity, index) => (
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
      {txnHistory.length > 0 ? (
        <table
          className={`activity-table ${
            theme === "light" ? "activity-table-light" : null
          }`}
        >
          <tbody>{activityRows}</tbody>
        </table>
      ) : (
        <div className="no-activity">
          <h2>No {noActivity} transaction activity</h2>
        </div>
      )}
    </div>
  );
};

export default Activity;
