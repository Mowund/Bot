const mongoose = require('mongoose');
const mongoPath =
  'mongodb+srv://Mowund:Mni9MRZ4K2OQRtZq@mowund.q5pk7.mongodb.net/mowund-db?retryWrites=true&w=majority';

module.exports = async () => {
  await mongoose.connect(mongoPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  return mongoose;
};
