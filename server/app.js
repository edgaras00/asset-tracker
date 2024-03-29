const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");

// Routers
const cryptoRouter = require("./routes/cryptoRoute");
const stocksRouter = require("./routes/stocksRoute");
const newsRouter = require("./routes/newsRoute");
const userRouter = require("./routes/userRoute");

// Error controller
const errorHandler = require("./controllers/errorController");

// Start Express application
const app = express();

// Global middlewares

// Handle CORS
app.use(cors());

// Security HTTP headers
app.use(helmet());

// Rate limiter to limit /user requests from the same IP address
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message:
    "Too many requests from this IP address. Please try again in an hour.",
});
app.use("/user", limiter);

// Body parser
// Read data from body into req.body
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS-attacks
app.use(xss());

// Routers
app.use("/crypto", cryptoRouter);
app.use("/stocks", stocksRouter);
app.use("/news", newsRouter);
app.use("/user", userRouter);
app.use("/ping", (req, res) => res.status(200).send("Welcome"));

// 404 NOT FOUND routes
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "Fail",
    message: `Can't find ${req.originalUrl} on this server`,
  });
});

app.use(errorHandler);
module.exports = app;
