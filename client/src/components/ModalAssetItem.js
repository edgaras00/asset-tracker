import React from "react";
import { Link } from "react-router-dom";

const ModalAssetItem = ({
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
  // Component for asset search results

  let assetLogo = "";
  let linkToInfo;
  if (type === "stock") {
    const assetLogoBase = "https://storage.googleapis.com/iexcloud-hl37opg/";
    assetLogo = assetLogoBase + `api/logos/${ticker}.png`;
    linkToInfo = `/company/${symbol}`;
  }
  if (type === "crypto" && logo) {
    assetLogo = logo;
    linkToInfo = `/crypto/${cid}`;
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
