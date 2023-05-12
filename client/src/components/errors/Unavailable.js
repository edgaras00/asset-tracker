import "../../styles/unavailable.css";

const Unavailable = ({ param, theme }) => {
  // Componenet that is rendered if there is a bad request
  // For crypto/stock page data
  const compClass = theme === "light" ? "unavailable-light" : "unavailable";
  return (
    <div className={compClass}>
      <h1>Something went wrong :(</h1>
      <h2>Data for {param} is not available</h2>
    </div>
  );
};

export default Unavailable;
