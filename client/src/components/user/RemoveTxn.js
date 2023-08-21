import { useState, useContext } from "react";
import Modal from "react-modal";
import { AppContext } from "../../context/appContext";

import {
  getDateString,
  handleErrors,
  setRequestOptions,
} from "../../utils/utils";

import "./styles/transaction.css";

const RemoveTxn = ({
  isModalOpen,
  closeModal,
  symbol,
  assetObjectId,
  type,
  assetPrice,
  totalAmount,
}) => {
  // Component for removing / selling assets

  const dateStr = getDateString();

  const [price, setPrice] = useState(assetPrice);
  const [quantity, setQuantity] = useState(0);
  const [txnDate, setTxnDate] = useState(dateStr);
  const [submitError, setSubmitError] = useState("");

  const { theme, setUser, authErrorLogout, token } = useContext(AppContext);
  const txnAssetType = type === "stock" ? "stock" : "crypto";

  const saveTxn = async (
    event,
    type,
    assetObjectId,
    price,
    quantity,
    totalAmount,
    token
  ) => {
    event.preventDefault();

    try {
      // Check if user is selling all of his/her holdings
      const sellingAll = totalAmount === Number(quantity) ? true : false;
      // Transaction object
      const txnObject = {
        // id: userId,
        [type]: {
          objectId: assetObjectId,
          symbol: symbol,
          amount: Number(quantity),
        },
        price: Number(price),
        date: txnDate,
        savedTimestamp: Date.now(),
        sellingAll,
      };
      // Request options
      const requestOptions = setRequestOptions("PUT", txnObject, token);

      let url = "https://alpha-assets-api.onrender.com/user/sell";
      if (process.env.REACT_APP_ENV === "development") {
        url = "/user/sell";
      }
      const response = await fetch(url, requestOptions);

      if (!response.ok || response.status !== 200) {
        handleErrors(response);
      }

      const data = await response.json();

      setUser(data.data.updatedUser);
      setPrice(0);
      setQuantity(0);
      closeModal();
    } catch (error) {
      console.error(error);
      if (error.name === "authError") {
        authErrorLogout();
        return;
      }
      setSubmitError("Something went wrong. Try again later.");
    }
  };

  return (
    <Modal
      ariaHideApp={false}
      isOpen={isModalOpen}
      onRequestClose={closeModal}
      style={{
        overlay: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(20, 20, 20, 0.80)",
        },
      }}
      className={`modal ${theme === "light" ? "modal-light" : null}`}
    >
      <div
        className={`transaction-form-container ${
          theme === "light" ? "transaction-form-container-light" : null
        }`}
      >
        <div
          className={`transaction-header ${
            theme === "light" ? "transaction-header-light" : null
          }`}
        >
          <div className="navigate-form-container">
            <span onClick={closeModal}>{"X"}</span>
          </div>
          <div className="txn-header-content">
            <div>SELL {symbol}</div>
          </div>
        </div>
        <form
          className={`transaction-form ${
            theme === "light" ? "transaction-form-light" : null
          }`}
          onSubmit={(e) =>
            saveTxn(
              e,
              txnAssetType,
              assetObjectId,
              price,
              quantity,
              totalAmount,
              token
            )
          }
        >
          <div className="form-inputs">
            <label
              className={`txn-input ${
                theme === "light" ? "txn-input-light" : null
              }`}
            >
              <span>Price</span>
              <input
                type="number"
                name="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>
            <label
              className={`txn-input ${
                theme === "light" ? "txn-input-light" : null
              }`}
            >
              <span>Quantity</span>
              <input
                type="number"
                name="quantity"
                min={0}
                step="any"
                max={totalAmount}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
            <label
              className={`txn-input ${
                theme === "light" ? "txn-input-light" : null
              }`}
            >
              <span>Date</span>
              <input
                type="date"
                name="date"
                value={txnDate}
                onChange={(e) => setTxnDate(e.target.value)}
              />
            </label>
            <div className="form-error">
              <span>{submitError}</span>
            </div>
            <button disabled={quantity === "0"}>Save Transaction</button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RemoveTxn;
