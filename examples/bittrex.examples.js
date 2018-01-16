
const bittrex = require('../node.bittrex.api');
const APIKEY = 'KEY';
const APISECRET = 'SECRET';

bittrex.options({ 
  'apikey' : APIKEY, 
  'apisecret' : APISECRET, 
  'stream' : false, 
  'verbose' : false, 
  'cleartext' : false 
});

/**
 *  sendCustomRequest example
 */
bittrex.sendCustomRequest( 'https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-ltc', function( data ) {
  console.log( data );
}, true);

bittrex.getmarketsummary({market : 'BTC-SC'}, function(data, error) {
    console.log( data.result );
});

/**
 *  getmarkethistory example
 */
//bittrex.getmarkethistory( { market : 'BTC-SC' }, function( data ) {
//  console.log( data.result );
//});

/**
 *  getorderbook example
 */
//bittrex.getorderbook( { market : 'BTC-PIVX', depth : 10, type : 'both' }, function( data ) {
//
//    data.result.buy.forEach(function(dataset) { console.log(dataset); });
//    data.result.sell.forEach(function(dataset) { console.log(dataset); });
//});

