import "./styles/summaryCard.css";
import "./styles/valueColors.css";

const SummaryCard = ({ title, value, theme, type, increasing }) => {
  const colorClassInc =
    theme === "light" ? "value-increase-light" : "value-increase";

  let percentClass;
  if (type === "percent" && increasing !== null) {
    percentClass = increasing ? colorClassInc : "value-decrease";
  }
  return (
    <div
      className={`summary-card ${
        theme === "light" ? "summary-card-light" : ""
      }`}
    >
      <h3>{title}</h3>
      <h2 className={percentClass}>
        {type === "usd" && value ? "$" : null}
        {value}
        {type === "percent" && value ? "%" : null}
      </h2>
    </div>
  );
};

export default SummaryCard;
