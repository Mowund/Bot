require('colors');
const sS = require('../schemas/strikes-schema');

module.exports = async (client, instance) => {
  /*const strike = { strike: 'warn', time: 1 };
  new sS(strike).save();*/

  (function f1() {
    setTimeout(async function () {
      var unix = Math.floor(+new Date() / 1000);

      await sS.updateMany({ time: { $lte: unix } }, {});

      f1();
    }, 1000);
  })();
};

module.exports.config = {
  displayName: 'Strikes',
  dbName: 'Strikes',
  loadDBFirst: true,
};
