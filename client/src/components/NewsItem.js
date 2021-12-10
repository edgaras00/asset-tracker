import React, { useContext } from "react";
import { AppContext } from "../context/appContext";
import "../styles/newsItem.css";

const NewsItem = (props) => {
  // Component for a news item

  const { theme } = useContext(AppContext);

  const lightThemeClass =
    props.type === "market" ? "article-light" : "company-article-light";
  const newsClass = props.type === "market" ? "article" : "company-article";
  return (
    <a
      href={props.url}
      rel="noopener noreferrer"
      target="_blank"
      className={
        props.type === "market" ? "article-link" : "company-article-link"
      }
    >
      <div
        className={`${newsClass} ${theme === "light" ? lightThemeClass : null}`}
      >
        <div className="news-content">
          <h2>{props.title}</h2>
          <span className="author">{props.author}</span>
          <h3 className="article-description">{props.description}</h3>
          <p>{props.content}</p>
          <div className="source-date">
            <div className="news-source">{props.source}</div>
            <div>{props.date}</div>
          </div>
        </div>
        <div className="news-image">
          <img src={props.image} alt="news" />
        </div>
        <br />
      </div>
    </a>
  );
};

export default NewsItem;
