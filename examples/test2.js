/**
 * Created by HoangLe on 1/12/2018.
 */
var async = require('async');
var request = require('request');
var cheerio = require('cheerio');

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

var calls = [];
var allMarkets = [];
bittrex.getmarketsummaries(function(data) {

    var promises = data.result.map(function(symbol) {
        if(!symbol.MarketName.includes('BTC')) {
            return new Promise(resolve => resolve());
        }

        return new Promise(function(resolve, reject) {
            var url = 'https://bittrex.com/Api/v2.0/pub/market/GetTicks?marketName=' + symbol.MarketName + '&tickInterval=day';

                request(url, function (error, response, html) {
                    if (!error && response.statusCode == 200) {
                        var obj = JSON.parse(html);
                        //console.log(symbol.MarketName + ' : ' + obj.result.length + ' : ' + JSON.stringify(obj.result[0]));
                        var market = {};
                        market.name = symbol.MarketName;
                        market.totalDays = obj.result.length;

                        var len = 1.0 * obj.result.length * 3.0 / 5.0;

                        if(obj.result.length < 150){
                            len = 1.0 * obj.result.length * 1.0 / 10.0;
                        }

                        market.calculatedDays = obj.result.length - len;
                        //console.log(symbol.MarketName + ' : ' + len + '/' + obj.result.length);
                        obj.result.splice(0, len);
                        var today = obj.result[obj.result.length - 1];
                        obj.result.sort(function(a, b) {
                           return a.C - b.C;
                        });



                        market.diffLow = today.C / obj.result[0].C;
                        market.diffHigh = obj.result[obj.result.length - 1].C / today.C;
                        market.today = today;
                        market.low = obj.result[0];

                        //if(today.BV > 500) {
                        allMarkets.push(market);
                        //}

                        resolve();
                    }
                    else {
                        return reject(error);
                    }
                });

        });
    });

    Promise.all(promises)
        .then(function() {

            allMarkets.sort(function(a, b) {
                //return a.diffHigh / a.diffLow - b.diffHigh / b.diffLow;
                return a.diffLow - b.diffLow;
            });
            //allMarkets.reverse();
            console.log(allMarkets);

        }).catch(console.error);


   /* for(var i = 0, len = data.result.length; i < len; ++i) {
        var symbol = data.result[i];
        //console.log(symbol);
        var call = (function () {
            var url = 'https://bittrex.com/Api/v2.0/pub/market/GetTicks?marketName=' + symbol.MarketName + '&tickInterval=day';
            return function() {
                request(url, function (error, response, html) {
                    if (!error && response.statusCode == 200) {
                        console.log(url + ' : ' + html.length);
                    }
                });
            }
        })();
        calls.push(call);
    }

    async.parallel(calls, function(err, result) {
        /!* this code will run after all calls finished the job or
         when any of the calls passes an error *!/
        if (err)
            return console.log(err);
        console.log("Finish all: " + result);
    });*/
});

