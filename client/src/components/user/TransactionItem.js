const TransactionItem = (props) => {
  return (
    <tr>
      <td>{props.date}</td>
      <td>{props.action}</td>
      <td>{props.symbol}</td>
      <td>{props.amount}</td>
      <td>${props.price}</td>
    </tr>
  );
};

export default TransactionItem;
