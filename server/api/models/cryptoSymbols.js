const mongoose = require('mongoose');

const cryptoSymbolsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    symbol: String,
    name: String,
    cid: String,
    cmcId: Number
});

cryptoSymbolsSchema.index({symbol: 'text', name: 'text'});
module.exports = mongoose.model('CryptoSymbols', cryptoSymbolsSchema);
