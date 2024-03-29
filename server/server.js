const mongoose = require("mongoose");
require("dotenv").config();

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log(err);
  console.log("Uncaught exception. Shutting down...");
  process.exit(1);
});

const app = require("./app");

// Connect to MongoDB
mongoose.connect(
  process.env.DB_CONNECT_CLOUD,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => console.log("Connected to the database")
);
// Use non-deprecated methods
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// Handle uncaught rejections
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled rejection. Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
