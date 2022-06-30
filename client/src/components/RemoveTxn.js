import React, { useState, useContext } from "react";
import Modal from "react-modal";
import { AppContext } from "../context/appContext";
import { getDateString, handleErrors } from "../utils/utils";

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
  const { theme, setUser, authErrorLogout } = useContext(AppContext);
  const txnAssetType = type === "stocks" ? "stock" : "crypto";

  const saveTxn = async (
    event,
    type,
    assetObjectId,
    price,
    quantity,
    totalAmount
  ) => {
    try {
      event.preventDefault();
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
      const options = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(txnObject),
      };
      const url = "https://track-investments.herokuapp.com/user/sell";
      const response = await fetch(url, options);

      if (response.status !== 200) {
        handleErrors(response);
      }

      const data = await response.json();

      setUser(data.data.updatedUser);
      setPrice(0);
      setQuantity(0);
      closeModal();
    } catch (error) {
      console.log(error);
      if (error.name === "authError") {
        authErrorLogout();
        return;
      }
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
      <form
        className={`add-txn-form ${
          theme === "light" ? "add-txn-form-light" : null
        }`}
        onSubmit={(e) =>
          saveTxn(e, txnAssetType, assetObjectId, price, quantity, totalAmount)
        }
      >
        <div className="exit-transaction">
          <div
            className={`exit-button ${
              theme === "light" ? "exit-button-light" : null
            }`}
            onClick={closeModal}
          >
            X
          </div>
        </div>
        <div
          className={`txn-action-select ${
            theme === "light" ? "txn-action-select-light" : null
          }`}
        >
          <div
            className={`txn-action ${
              theme === "light" ? "txn-action-light" : null
            }`}
          >
            SELL {symbol}
          </div>
        </div>
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
        <button disabled={quantity === "0"}>Save Transaction</button>
      </form>
    </Modal>
  );
};

export default RemoveTxn;
