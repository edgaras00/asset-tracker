import { useState, useContext, useEffect, useCallback, useRef } from "react";
import { AppContext } from "../../context/appContext";

import {
  getDateString,
  handleErrors,
  setRequestOptions,
} from "../../utils/utils";

import "./styles/transaction.css";

const getPrice = async (type = "stock", symbol, token) => {
  try {
    let url = `https://alpha-assets-api.onrender.com/stocks/prices/${symbol}`;
    if (import.meta.env.REACT_APP_ENV === "development") {
      url = `/stocks/prices/${symbol}`;
    }
    if (type === "crypto") {
      url = `https://alpha-assets-api.onrender.com/crypto/current/${symbol}`;
      if (import.meta.env.REACT_APP_ENV === "development") {
        url = `/crypto/current/${symbol}`;
      }
    }

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const priceData = await response.json();

    if (response.status !== 200) {
      throw new Error("Failed to retrieve price data.");
    }

    if (type === "crypto") {
      return priceData.data[symbol].usd;
    }

    return priceData.data.price;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const AddTxn = ({
  type,
  asset,
  setAddingTxn,
  closeModal,
  setSearchData,
  setSearch,
  theme,
}) => {
  // Component that lets user to add assets

  // Format default date (today)
  const dateStr = getDateString();

  // Component state
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [txnDate, setTxnDate] = useState(dateStr);
  const [priceError, setPriceError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const { setUser, authErrorLogout, token } = useContext(AppContext);
  const mountedRef = useRef(true);

  const handleSubmitTxn = async (
    event,
    type,
    asset,
    price,
    quantity,
    token
  ) => {
    event.preventDefault();

    try {
      // Transaction object that will be sent in the body of a PUT request
      const txnObject = {
        [type]: {
          name: asset.name,
          symbol: asset.symbol.toUpperCase(),
          amount: Number(quantity),
        },
        price: Number(price),
        date: txnDate,
        savedTimestamp: Date.now(),
      };
      // Crypto transactions require additional property (Coingecko id)
      if (type === "crypto") {
        txnObject.crypto["cid"] = asset.cid;
      }
      // Request url
      let url = "https://alpha-assets-api.onrender.com/user/buy";
      if (import.meta.env.REACT_APP_ENV === "development") {
        url = "/user/buy";
      }

      const requestOptions = setRequestOptions("PUT", txnObject, token);
      const response = await fetch(url, requestOptions);

      if (!response.ok || response.status !== 200) {
        handleErrors(response);
      }

      const data = await response.json();

      setUser(data.data.data.updatedUser);
      setPrice(0);
      setQuantity(0);
      setAddingTxn(false);
      setSearchData([]);
      setSearch("");
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

  const fetchAssetPrice = useCallback(
    async (type, asset) => {
      if (!mountedRef.current) return;
      try {
        if (type === "stock") {
          const price = await getPrice(type, asset.symbol, token);
          setPrice(price);
          return;
        }
        const price = await getPrice(type, asset.cid, token);
        setPrice(price);
        return;
      } catch (error) {
        console.error(error);
        setPrice(0);
        setPriceError("Failed to retrieve price data");
      }
    },
    [mountedRef, token]
  );

  useEffect(() => {
    fetchAssetPrice(type, asset);
    return () => {
      mountedRef.current = false;
    };
  }, [fetchAssetPrice, asset, type]);

  return (
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
          <span onClick={() => setAddingTxn(false)}>{"<<"}</span>
        </div>
        <div className="txn-header-content">
          <div>BUY {asset.symbol}</div>
        </div>
      </div>
      <form
        className={`transaction-form ${
          theme === "light" ? "transaction-form-light" : null
        }`}
        onSubmit={(e) =>
          handleSubmitTxn(e, type, asset, price, quantity, token)
        }
      >
        <div className="form-inputs">
          <label
            htmlFor="price"
            className={`txn-input ${
              theme === "light" ? "txn-input-light" : null
            }`}
          >
            <span>Price</span>
            <input
              type="number"
              name="price"
              step="any"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <div className={`${priceError ? "form-error" : "hidden"}`}>
            <span>{priceError}</span>
          </div>
          <label
            className={`txn-input ${
              theme === "light" ? "txn-input-light" : null
            }`}
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
        </div>
        <div className="form-error">
          <span>{submitError}</span>
        </div>
        <button>Save Transaction</button>
      </form>
    </div>
  );
};

export default AddTxn;
