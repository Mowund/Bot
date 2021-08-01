const mongoose = require('mongoose');

const reqString = {
  type: String,
  require: true,
};

const strikesSchema = mongoose.Schema({
  strike: reqString,
  time: Number,
});

module.exports = mongoose.model('strikes', strikesSchema);
