/**
 * Created by HoangLe on 1/12/2018.
 */
//'use strict';

var Test2 = (function() {

    var async = require('async');
    var request = require('request');
    var cheerio = require('cheerio');
    var json2csv = require('json2csv');
    var fs = require('fs');

    const bittrex = require('../node.bittrex.api');
    const APIKEY = 'KEY';
    const APISECRET = 'SECRET';


    bittrex.options({
        'apikey': APIKEY,
        'apisecret': APISECRET,
        'stream': false,
        'verbose': false,
        'cleartext': false
    });

    var calls = [];
    var allMarkets = [];

    return {
        testAA: function () {
            console.log("TestAA");
        },

        getAllMarkets: function () {
            console.log('getAllMarkets ... ');

            return new Promise(function (res, rej) {

                bittrex.getmarketsummaries(function (data) {

                    var promises = data.result.map(function (symbol) {
                        if (!symbol.MarketName.includes('BTC')) {
                            return new Promise(resolve => resolve());
                        }

                        return new Promise(function (resolve, reject) {
                            var url = 'https://bittrex.com/Api/v2.0/pub/market/GetTicks?marketName=' + symbol.MarketName + '&tickInterval=day';

                            request(url, function (error, response, html) {
                                if (!error && response.statusCode == 200) {
                                    var obj = JSON.parse(html);
                                    //console.log(symbol.MarketName + ' : ' + obj.result.length + ' : ' + JSON.stringify(obj.result[0]));
                                    var market = {};
                                    market.name = symbol.MarketName;
                                    market.totalDays = obj.result.length;

                                    //console.log(symbol.MarketName + ' : ' + len + '/' + obj.result.length);
                                    if (obj.result.length > 150) {
                                        obj.result.splice(0, 20);
                                    }
                                    else if (obj.result.length > 50) {
                                        obj.result.splice(0, 5);
                                    }

                                    var today = obj.result[obj.result.length - 1];
                                    obj.result.sort(function (a, b) {
                                        return a.C - b.C;
                                    });

                                    market.diffLow = today.C / obj.result[0].C;
                                    market.diffHigh = obj.result[obj.result.length - 1].C / today.C;
                                    market.today = today;
                                    market.low = obj.result[0];
                                    market.high = obj.result[obj.result.length - 1];
                                    market.totalBuy = 0;
                                    market.totalSell = 0;
                                    market.buySellFactor = 0;

                                    if (today.BV > 10) {
                                        allMarkets.push(market);
                                    }

                                    resolve();
                                }
                                else {
                                    return reject(error);
                                }
                            });

                        });
                    });

                    Promise.all(promises)
                        .then(function () {

                            allMarkets.sort(function (a, b) {
                                //return a.diffHigh / a.diffLow - b.diffHigh / b.diffLow;
                                return a.diffLow - b.diffLow;
                            });
                            //allMarkets.reverse();

                            res(allMarkets);

                            /* var fields = ['name', 'totalDays', 'diffLow', 'diffHigh', 'today', 'low', 'high'];

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
                             console.error(err);
                             }*/

                        })
                        .catch(function (errL) {
                            console.log("ErrorL:" + errL);
                            rej();
                        });
                });
            });
        }
    }
})();

module.exports = Test2;