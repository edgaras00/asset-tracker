import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { getDateString, handleErrors } from "../utils/utils";
import { AppContext } from "../context/appContext";

const getCurrentPrice = async (type, id) => {
  // Function to get the current price of the asset
  try {
    let url = `https://track-investments.herokuapp.com/crypto/current/${id}`;
    if (type === "stock") {
      url = `https://track-investments.herokuapp.com/stocks/current/${id}`;
    }
    const response = await fetch(url);

    if (response.status !== 200) {
      handleErrors(response);
    }

    const priceData = await response.json();

    if (type === "stock") {
      return priceData.data.price;
    }
    return priceData.data[id].usd;
  } catch (error) {
    console.log(error);
    if (error.name === "authError") return "authError";
    if (error.name === "serverError") return "serverError";
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
  const { setUser, authErrorLogout } = useContext(AppContext);
  const mountedRef = useRef(true);

  const saveTxn = async (event, type, asset, price, quantity) => {
    // Async function to save a buy transaction
    try {
      event.preventDefault();
      // Transaction object that will be sent in the body of a POST request
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
      const url = "/user/buy";
      // Request options
      const options = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txnObject),
      };

      const response = await fetch(url, options);

      if (response.status !== 200) {
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
      console.log(error);
      if (error.name === "authError") {
        authErrorLogout();
        return;
      }
    }
  };

  const fetchCurrentPrice = useCallback(
    async (type, asset) => {
      try {
        if (type === "crypto") {
          const cryptoPrice = await getCurrentPrice("crypto", asset.cid);

          if (cryptoPrice === "auth") {
            authErrorLogout();
            return;
          }

          if (!mountedRef.current) return;

          setPrice(cryptoPrice);
          return;
        }

        // Fetch stock price data
        if (type === "stock") {
          const stockPrice = await getCurrentPrice("stock", asset.symbol);

          if (stockPrice === "auth") {
            authErrorLogout();
            return;
          }

          if (!mountedRef.current) return;

          setPrice(stockPrice);
          return;
        }
      } catch (error) {
        console.log(error);
      }
    },
    [mountedRef, authErrorLogout]
  );

  useEffect(() => {
    fetchCurrentPrice(type, asset);
    return () => {
      mountedRef.current = false;
    };
  }, [fetchCurrentPrice, asset, type]);

  return (
    <form
      className={`add-txn-form ${
        theme === "light" ? "add-txn-form-light" : null
      }`}
      onSubmit={(e) => saveTxn(e, type, asset, price, quantity)}
    >
      <div
        className={`back-button-cont ${
          theme === "light" ? "back-button-cont-light" : null
        }`}
      >
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
