import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { getDateString, handleErrors } from "../utils/utils";
import { AppContext } from "../context/appContext";

const getPrice = async (type = "stock", symbol) => {
  // if (!["stock", "crypto"].includes(type) || typeof symbol !== String) {
  //   throw new Error("Invalid inputs");
  // }

  try {
    let url = `/stocks/prices/${symbol}`;

    if (type === "crypto") {
      url = `/crypto/current/${symbol}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (type === "crypto") {
      return data.data[symbol].usd;
    }

    return data.data.price;
  } catch (error) {
    console.error(error);
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
  console.log(asset);
  // Component that lets user to add assets

  // Format default date (today)
  const dateStr = getDateString();

  // Component state
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [txnDate, setTxnDate] = useState(dateStr);
  const { setUser, authErrorLogout } = useContext(AppContext);
  // const mountedRef = useRef(true);

  const handleSubmitTxn = async (event, type, asset, price, quantity) => {
    try {
      event.preventDefault();
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
      const url = "/user/buy";
      // Request options
      const options = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txnObject),
      };

      const response = await fetch(url, options);
      const data = await response.json();

      if (response.status !== 200) {
        handleErrors(response);
      }

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

  useEffect(() => {
    const fetchAssetPrice = async (type, asset) => {
      if (type === "stock") {
        const price = await getPrice(type, asset.symbol);
        setPrice(price);
        return;
      }
      const price = await getPrice(type, asset.cid);
      setPrice(price);
      return;
    };
    fetchAssetPrice(type, asset);
  }, [asset, type]);

  return (
    <form
      className={`add-txn-form ${
        theme === "light" ? "add-txn-form-light" : null
      }`}
      onSubmit={(e) => handleSubmitTxn(e, type, asset, price, quantity)}
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
