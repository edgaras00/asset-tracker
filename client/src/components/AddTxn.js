import React, { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../context/themeContext";
import {getDateString} from '../utils/utils';

const AddTxn = ({
  type,
  asset,
  userId,
  setAddingTxn,
  closeModal,
  setSearchData,
  setSearch,
  theme,
}) => {
  // Component that lets user to add assets

  // Format default date (today)

  const dateStr = getDateString();

  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [txnDate, setTxnDate] = useState(dateStr);
  const { setUser } = useContext(ThemeContext);

  const saveTxn = async (event, userId, type, asset, price, quantity) => {
    // Async function to save a buy transaction
    try {
      event.preventDefault();
      // Transaction object that will be sent in the body of a POST request
      const txnObject = {
        _id: userId,
        [type]: {
          name: asset.name,
          symbol: asset.symbol.toUpperCase(),
          amount: Number(quantity),
        },
        price: Number(price),
        date: txnDate,
      };
      // Crypto transactions require additional property (Coingecko id)
      if (type === "crypto") {
        txnObject.crypto["cid"] = asset.cid;
      }
      // Request url
      const url = `http://localhost:5000/user/${userId}`;
      // Request options
      const options = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txnObject),
      };

      const response = await fetch(url, options);
      if (!response.ok) {
        console.log("error");
        return;
      }
      const data = await response.json();
      setUser(data.result.updatedUser);
      setPrice(0);
      setQuantity(0);
      setAddingTxn(false);
      setSearchData([]);
      setSearch("");
      closeModal();
    } catch (error) {
      console.log(error);
    }
  };

  const getCurrentPrice = async (type, id) => {
    // Function to get the current price of the asset

    let url = `http://localhost:5000/crypto/current/${id}`;
    if (type === "stock") {
      url = `http://localhost:5000/stocks/current/${id}`;
    }
    const response = await fetch(url);
    const priceData = await response.json();

    if (type === "stock") {
      setPrice(priceData.price);
      return;
    }
    setPrice(priceData.assetValue[id].usd);
  };

  useEffect(() => {
    // Fetch crypto price data
    if (type === "crypto") {
      getCurrentPrice("crypto", asset.cid);
      return;
    }

    // Fetch stock price data
    if (type === "stock") {
      getCurrentPrice("stock", asset.symbol);
      return;
    }
  }, [asset.cid, asset.symbol, type]);

  return (
    <form
      className={`add-txn-form ${
        theme === "light" ? "add-txn-form-light" : null
      }`}
      onSubmit={(e) => saveTxn(e, userId, type, asset, price, quantity)}
    >
      <div
        className={`back-button-cont ${
          theme === "light" ? "back-button-cont-light" : null
        }`}
      >
        {/* <button onClick={() => setAddingTxn(false)}>{"<<"}</button> */}
        <div
          className={`back-button ${
            theme === "light" ? "back-button-light" : null
          }`}
          onClick={() => setAddingTxn(false)}
        >
          {"<<"}
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
          BUY {asset.symbol}
        </div>
      </div>
      <label
        className={`txn-input ${theme === "light" ? "txn-input-light" : null}`}
      >
        <span>Price</span>
        <input
          type="number"
          name="price"
          step="any"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </label>
      <label
        className={`txn-input ${theme === "light" ? "txn-input-light" : null}`}
      >
        <span>Quantity</span>
        <input
          type="number"
          name="quantity"
          value={quantity}
          step="any"
          min="0.000000000000000001"
          onChange={(e) => setQuantity(e.target.value)}
        />
      </label>
      <label
        className={`txn-input ${theme === "light" ? "txn-input-light" : null}`}
      >
        <span>Date</span>
        <input
          type="date"
          name="date"
          value={txnDate}
          onChange={(e) => setTxnDate(e.target.value)}
        />
      </label>

      <button>Save Transaction</button>
    </form>
  );
};

export default AddTxn;
