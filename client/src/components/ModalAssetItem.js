import React from "react";
import noLogo from "../img/404.jpg";
import { Link } from "react-router-dom";

const ModalAssetItem = ({
  // Component for asset search results

  theme,
  ticker,
  symbol,
  name,
  type,
  cid,
  setAsset,
  toggleAddingTxn,
  logo,
}) => {
  let assetLogo = "";
  let linkToInfo;
  if (type === "stock") {
    const assetLogoBase = "https://storage.googleapis.com/iexcloud-hl37opg/";
    assetLogo = assetLogoBase + `api/logos/${ticker}.png`;
    linkToInfo = `/company/${symbol}`;
  }
  if (type === "crypto" && logo) {
    // logo = `https://s2.coinmarketcap.com/static/img/coins/64x64/${cmcId}.png`;
    assetLogo = logo;
    linkToInfo = `/crypto/${cid}`;
  } else if (type === "crypto" && logo === "NA") {
    linkToInfo = `/crypto/${cid}`;
    assetLogo = noLogo;
  }

  return (
    <div
      className={`modal-asset-item ${
        theme === "light" ? "modal-asset-item-light" : null
      }`}
    >
      <div
        className={`modal-asset-name ${
          theme === "light" ? "modal-asset-name-light" : null
        }`}
      >
        <img src={assetLogo} alt="asset" />
        <span>
          <Link to={linkToInfo}>
            {symbol.toUpperCase()} {name}
          </Link>
        </span>
      </div>
      <div
        className={`modal-add ${theme === "light" ? "modal-add-light" : null}`}
        onClick={() => {
          toggleAddingTxn(true);
          if (type === "stock") {
            setAsset({ symbol, name });
            return;
          }
          setAsset({ symbol, name, cid });
        }}
      >
        +
      </div>
    </div>
  );
};

export default ModalAssetItem;
