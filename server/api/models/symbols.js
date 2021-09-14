const mongoose = require('mongoose');

const symbolsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    symbol: String,
    name: String
});

symbolsSchema.index({symbol: 'text', name: 'text'});
module.exports = mongoose.model('Symbols', symbolsSchema);