import { useState, useContext } from "react";
import { AppContext } from "../../context/appContext";

import Modal from "react-modal";
import ModalAssetItem from "./ModalAssetItem";
import AddTxn from "./AddTxn";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { handleErrors } from "../../utils/utils";

import "./styles/searchModal.css";

const SearchModal = ({ isModalOpen, closeModal }) => {
  // Modal component to search for assets

  const { theme, authErrorLogout } = useContext(AppContext);
  const searchIcon = <FontAwesomeIcon icon={faSearch} />;

  const [search, setSearch] = useState("");

  // Select type of asset to search for
  const [selectedType, setSelectedType] = useState("stock");
  const [searchData, setSearchData] = useState([]);
  const [addingTxn, setAddingTxn] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [error, setError] = useState("");

  const lightModeStocks = selectedType === "stock" ? "selected-light" : null;
  const lightModeCrypto = selectedType === "crypto" ? "selected-light" : null;

  const handleKeyUp = async (event, assetType) => {
    // Function that lets user to submit search query using the Enter key
    setError("");
    try {
      const endpoint = assetType === "stock" ? "stocks" : "crypto";
      if (event.keyCode === 13) {
        let url = `https://asset-tracker-api.onrender.com/${endpoint}/search?query=${search}`;
        if (process.env.NODE_ENV === "development") {
          url = `/${endpoint}/search?query=${search}`;
        }
        const response = await fetch(url);

        if (!response.ok || response.status !== 200) {
          handleErrors(response);
        }

        const data = await response.json();

        setSearchData(data.data);
      }
    } catch (error) {
      console.error(error);
      if (error.name === "authError") authErrorLogout();
      setError("Something went wrong. Try again later.");
    }
  };

  // Array of search result objects
  // Object info: logo (if available), ticker/symbol, name
  const searchItems = searchData.map((item, index) => {
    const ticker = item.symbol.toUpperCase();
    return (
      <ModalAssetItem
        key={index + ticker}
        ticker={ticker}
        name={item.name}
        symbol={item.symbol}
        theme={theme}
        cid={item.id}
        type={selectedType}
        toggleAddingTxn={setAddingTxn}
        setAsset={setSelectedAsset}
        logo={item.logo}
      />
    );
  });

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
      {addingTxn ? (
        <AddTxn
          type={selectedType}
          asset={selectedAsset}
          setAddingTxn={setAddingTxn}
          closeModal={closeModal}
          setSearchData={setSearchData}
          setSearch={setSearch}
          theme={theme}
        />
      ) : (
        <div
          className={`modal-content ${
            theme === "light" ? "modal-content-light" : null
          }`}
        >
          <div
            className={`close-modal-btn ${
              theme === "light" ? "close-modal-btn-light" : null
            }`}
          >
            <div
              className={`close-button ${
                theme === "light" ? "close-button-light" : null
              }`}
              onClick={closeModal}
            >
              X
            </div>
          </div>
          <div
            className={`search-header ${
              theme === "light" ? "search-header-light" : null
            }`}
          >
            <div
              className={`modal-asset-type ${
                theme === "light" ? "modal-asset-type-light" : null
              } ${selectedType === "stock" ? "selected" : null} ${
                theme === "light" ? lightModeStocks : null
              }`}
              onClick={() => {
                setSelectedType("stock");
                setSearchData([]);
                setSearch("");
              }}
            >
              STOCKS
            </div>
            <div
              className={`modal-asset-type ${
                selectedType === "crypto" ? "selected" : null
              } ${theme === "light" ? "modal-asset-type-light" : null} ${
                theme === "light" ? lightModeCrypto : null
              }`}
              onClick={() => {
                setSelectedType("crypto");
                setSearchData([]);
                setSearch("");
              }}
            >
              CRYPTO
            </div>
          </div>
          <div className="modal-search">
            <div className="searchbar">
              <div
                className={`icon ${theme === "light" ? "icon-light" : null}`}
              >
                {searchIcon}
              </div>
              <input
                name="search"
                value={search}
                placeholder={`Search for ${
                  selectedType === "crypto" ? "crypto" : "stocks"
                }`}
                onChange={(e) => setSearch(e.target.value)}
                onKeyUp={(e) => handleKeyUp(e, selectedType)}
              />
            </div>
            <div className="modal-item-container">{searchItems}</div>
            <div className="search-error">{error}</div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SearchModal;
