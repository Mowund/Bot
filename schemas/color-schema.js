const mongoose = require('mongoose');

const reqString = {
  type: String,
  require: true,
};

const colorSchema = mongoose.Schema({
  cI: [reqString],
});

module.exports = mongoose.model('colors', colorSchema);
