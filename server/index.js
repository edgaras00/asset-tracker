const express = require('express');
require("dotenv").config();
const mongoose = require('mongoose');
// const cryptoRouter = require('./api/routes/crypto0');
const cryptoRouter = require('./api/routes/crypto');
const stocksRouter = require('./api/routes/stocks');
// const stocksRouter2 = require('./api/routes/stocks');
const assetRouter = require('./api/routes/assets');
const userRouter = require('./api/routes/user');
const newsRouter = require('./api/routes/news');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors({credentials: true}));

mongoose.connect(
  process.env.DB_CONNECT,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => console.log("Connected to the database")
);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);



app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/crypto', cryptoRouter);
app.use('/stocks', stocksRouter);
app.use('/assets', assetRouter);
app.use('/user', userRouter);
app.use('/news', newsRouter);




// Error handling
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res) => {
    res.status(error.status || 500);
    res.json({
        error: error.message
    })
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));