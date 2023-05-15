import { useState, useContext } from "react";
import NewsItem from "./NewsItem";
import { AppContext } from "../../context/appContext";

import "./styles/companyNews.css";

const CompanyNews = ({ newsData }) => {
  // Company news component
  const { theme } = useContext(AppContext);
  const [expand, setExpand] = useState(true);

  // const data = news.articles;

  // const newsItems = data.slice(0, 5).map((article, index) => {
  const newsItems = newsData.map((article, index) => {
    return (
      <NewsItem
        key={index + article.title}
        title={article.title}
        author={article.author}
        description={article.description}
        content={article.content.split("[+")[0]}
        date={article.publishedAt}
        source={article.source.name}
        image={article.urlToImage}
        url={article.url}
        type="company"
      />
    );
  });

  return (
    <div className="company-news-container">
      <div
        className={`company-news-header ${
          theme === "light" ? "company-news-header-light" : null
        }`}
      >
        <h2>News</h2>
        {expand ? (
          <span onClick={() => setExpand(false)}>Hide</span>
        ) : (
          <span onClick={() => setExpand(true)}>Show</span>
        )}
      </div>
      <br />
      {expand ? <div className="company-news">{newsItems}</div> : null}
    </div>
  );
};

export default CompanyNews;
