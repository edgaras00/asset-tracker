import "./styles/activityRow.css";

const ActivityRow = ({ action, date, amount, price, symbol }) => {
  // User's activity table row component

  // Format date display string
  const dateObj = new Date(date);
  const month = dateObj.toLocaleString("default", { month: "short" });
  const day = dateObj.getDate();

  const value = amount * price;

  return (
    <tr>
      <td>
        <div className="txn-date">
          <div className="date">
            <div className="month">{month.toUpperCase()}</div>
            <div>{day}</div>
          </div>
          <div className="buy-icon">{action.toUpperCase()}</div>
          <div className="description">
            {action === "Buy" ? `Bought ${symbol}` : `Sold ${symbol}`}
          </div>
        </div>
      </td>
      <td className="amount">
        <div className="display-amount">
          <div className="asset-amount">{`${amount} ${symbol}`}</div>
          <div className="value-usd">${value.toFixed(2)}</div>
        </div>
      </td>
    </tr>
  );
};

export default ActivityRow;
