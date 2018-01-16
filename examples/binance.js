/**
 * Created by HoangLe on 1/12/2018.
 */
var async = require('async');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

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


request('https://api.binance.com/api/v1/exchangeInfo', function(error1, response1, html1) {
    if (!error1 && response1.statusCode == 200) {
        var markets = JSON.parse(html1);
        var promises = markets.symbols.map(function(symbol) {
            if(!symbol.symbol.includes('BTC')) {
                return new Promise(resolve => resolve());
            }

            return new Promise(function(resolve, reject) {
                var url = 'https://api.binance.com/api/v1/klines?symbol=' + symbol.symbol + '&interval=1d';

                request(url, function (error, response, html) {
                    if (!error && response.statusCode == 200) {
                        var days = JSON.parse(html);

                        var obj = [];
                        for(var i = 0, len = days.length; i < len; ++i) {
                            var temp = days[i];
                            obj[i] = {};

                            var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
                            d.setUTCSeconds(temp[0]);

                            obj[i].OpenTime = d;
                            obj[i].O = parseFloat(temp[1]);
                            obj[i].H = parseFloat(temp[2]);
                            obj[i].L = parseFloat(temp[3]);
                            obj[i].C = parseFloat(temp[4]);
                            obj[i].V = parseFloat(temp[5]);
                            var d1 = new Date(0); // The 0 there is the key, which sets the date to the epoch
                            d1.setUTCSeconds(temp[6]);
                            obj[i].CloseTime = d1;
                            obj[i].BV = parseFloat(temp[7]);
                            obj[i].NumberOfTrade = parseInt(temp[8]);
                        }


                       console.log(symbol.symbol + ' : ' + obj.length + ' : ' + JSON.stringify(obj[0]));


                        var market = {};
                        market.name = symbol.symbol;
                        market.totalDays = obj.length;
                        market.calculatedDays = obj.length;
                        //console.log(symbol.MarketName + ' : ' + len + '/' + obj.result.length);
                        //obj.splice(0, 5);

                        var today = obj[obj.length - 1];



                        obj.sort(function(a, b) {
                            return a.C - b.C;
                        });

                        market.diffLow = today.C / obj[0].C;
                        market.diffHigh = obj[obj.length - 1].C / today.C;
                        market.today = today;
                        market.low = obj[0];
                        market.high = obj[obj.length - 1];
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
                //console.log(allMarkets);

                var d = JSON.stringify(allMarkets);
                console.log("data: " + d);


                var fileName = "report_binance_"+ new Date().toISOString().replace(':', '-') + ".json";

                /*var stream = fs.createWriteStream(fileName);
                stream.once('open', function(fd) {
                    stream.write(d);
                    stream.end();
                    console.log("done writing file");
                });*/

                fs.writeFile(fileName, d, function(err) {
                 if(err != null) {
                 console.log("write file error: " + err);
                 }
                 else {
                 console.log("done writing file");
                 }
                 });

            }).catch(console.error);
    }
});




