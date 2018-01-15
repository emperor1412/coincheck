
const bittrex = require('../node.bittrex.api');

bittrex.options({
  'verbose' : true,
});

console.log('Connecting ....');
bittrex.websockets.subscribe(['BTC-SC'], function(data, client) {
  //console.log(data);
  if(data.unhandled_data !== undefined && data.unhandled_data.R !== undefined) {
    console.log(data.unhandled_data.R);
  }
  else if (data.M === 'updateExchangeState') {
    data.A.forEach(function(data_for) {
      //console.log('Market Update for '+ data_for.MarketName, data_for);
    });
  }
});
