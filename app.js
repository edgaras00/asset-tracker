const express = require("express");
const path = require("path");
const cryptoRouter = require("./routes/cryptoRoute");
const stocksRouter = require("./routes/stocksRoute");
const newsRouter = require("./routes/newsRoute");
const userRouter = require("./routes/userRoute");
const errorHandler = require(".//controllers/errorController");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Start Express application
const app = express();

// Handle CORS (with cookies)
app.use(cors());

// Body parser
// Read data from body into req.body
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routers
app.use("/crypto", cryptoRouter);
app.use("/stocks", stocksRouter);
app.use("/news", newsRouter);
app.use("/user", userRouter);

app.use(express.static(path.join(__dirname, "/client/build")));

if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "/client/build", "index.html"));
  });

  app.all("*", (req, res, next) => {
    res.status(404).json({
      status: "Fail",
      message: `Can't find ${req.originalUrl} on this server`,
    });
  });
}

app.use(errorHandler);
module.exports = app;
