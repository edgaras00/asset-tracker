const express = require("express");
const cryptoRouter = require("./api/routes/cryptoRoute");
const stocksRouter = require("./api/routes/stocksRoute");
const newsRouter = require("./api/routes/newsRoute");
const userRouter = require("./api/routes/userRoute");
const errorHandler = require("./api/controllers/errorController");
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

app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "Fail",
    message: `Can't find ${req.originalUrl} on this server`,
  });
});

app.use(errorHandler);
module.exports = app;
