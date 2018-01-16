/**
 * Created by HoangLe on 1/15/2018.
 */
const bittrex = require('../node.bittrex.api');
const APIKEY = 'KEY';
const APISECRET = 'SECRET';
var json2csv = require('json2csv');
var fs = require('fs');

bittrex.options({
    'apikey': APIKEY,
    'apisecret': APISECRET,
    'stream': false,
    'verbose': true,
    'cleartext': false
});


var test2 = require('./Test2');


var calculateSum = function (orders) {
    var total = 0;
    for (var i = 0, len = orders.length; i < len; ++i) {
        var order = orders[i];
        var sum = order.Quantity * order.Rate;
        total += sum;
    }
    return total;
}


test2.testAA();

test2.getAllMarkets().then(function (allMarkets) {

    //console.log(allMarkets);

    console.log('Getting orderbooks ....');
    //var promises = [];

    var promises = allMarkets.map(function (market) {
        if (market.name.includes('BTC-ARDR')) {
            return new Promise(resolve => resolve());
        }

        return new Promise(function (res, rej) {
            bittrex.getorderbook({market: market.name, type: "buy"}, function (data) {
                //console.log(market.name + ": buy: " + data.result );
                if(data === undefined || data.result === null) {
                    console.log(market.name  + ": Null buy");
                    rej();
                    return;
                }

                var totalBuy = calculateSum(data.result);
                //console.log('totalBuy: ' + totalBuy);
                market.totalBuy = totalBuy;

                bittrex.getorderbook({market: market.name, type: "sell"}, function (data) {
                    //console.log(market.name + ": sell: " + data.result );
                    if(data === undefined || data.result === null) {
                        console.log(market.name  + ": Null sell");
                        rej();
                        return;
                    }

                    var totalSell = calculateSum(data.result);

                    market.totalSell = totalSell;
                    market.buySellFactor = totalBuy / totalSell;
                    console.log(market);
                    res();
                });

            });
        });
    });

    /*
    promises.concat(allMarkets.map(function (market) {
        if (market.name.includes('BTC-ARDR')) {
            return new Promise(resolve => resolve());
        }

        return new Promise(function (res, rej) {
            bittrex.getorderbook({market: market.name, type: "sell"}, function (data) {
                //console.log(market.name + ": sell: " + data.result );
                if(data === undefined || data.result === null) {
                    console.log(market.name  + ": Null sell");
                    rej();
                    return;
                }

                var totalSell = calculateSum(data.result);
                //console.log('totalSell: ' + totalBuy);
                market.totalSell = totalSell;
                res();
            });
        });
    }));
*/

    Promise.all(promises).then(function () {
        var fields = ['name', 'totalDays', 'diffLow', 'diffHigh', 'today', 'low', 'high', 'totalBuy', 'totalSell', 'buySellFactor'];

        //console.log(JSON.stringify(allMarkets));

        try {
            var result = json2csv({data: allMarkets, fields: fields});
            console.log(result);

            fs.writeFile("report_bittrex.csv", result, function (error) {
                if (error) {
                    return console.log(error);
                }

                console.log("The file was saved!");
            });

        } catch (err) {
            // Errors are thrown for bad options, or if the data is empty and no fields are provided.
            // Be sure to provide fields if it is possible that your data array will be empty.
            console.error("Error: " + err);
        }
    }).catch(function(errorL){
        console.error("ErrorL: " + errorL);
    });
});


/*
 console.log('Connecting ....');

 bittrex.websockets.subscribe(['BTC-SC'], function(data, client) {
 //console.log(data);
 if(data.unhandled_data !== undefined && data.unhandled_data.R !== undefined
 && data.unhandled_data.R.Buys !== undefined && data.unhandled_data.R.Sells !== undefined) {
 //console.log(data.unhandled_data.R);
 var totalBuy = calculateSum(data.unhandled_data.R.Buys);
 console.log('WS_totalBuy: ' + totalBuy);
 var totalSell = calculateSum(data.unhandled_data.R.Sells);
 console.log('WS_totalSell: ' + totalSell);
 }
 else if (data.M === 'updateExchangeState') {
 data.A.forEach(function(data_for) {
 //console.log('Market Update for '+ data_for.MarketName, data_for);
 });
 }
 });*/
