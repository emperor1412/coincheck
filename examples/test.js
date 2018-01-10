var request = require('request');
var cheerio = require('cheerio');
var sequenty = require('sequenty');

var allData = [];

function checkCoin(coinID, order, callback) {
    var link = 'https://coinmarketcap.com/currencies/' + coinID + '/#markets';
    request(link, function (error, response, html) {
        if (!error && response.statusCode == 200) {

            var coinData = {};
            coinData.min = 1000;
            coinData.max = -1000;
            var data = [];

            $ = cheerio.load(html);
            $('tr', '#markets-table').each(function(i, row){
                //var a = $(this).prev();
                //console.log(a.text());

                var san = '';
                var isBTCPair = false;
                $('a', row).each(function(i, a) {
                    var ref = $(a).attr('href');
                    var text = $(a).text();

                    if(!ref.includes('http')) {
                        san += text + ' - ';
                    }
                    else {
                        san += ref + ' - ';
                    }

                    if(text.includes('BTC') && ref.includes('http')) {
                        isBTCPair = true;
                    }
                });
                var price = $('span[class=price]', row).attr('data-btc');

                if(isBTCPair) {
                    var item = {};
                    item.san = san;
                    item.price = price * 1;
                    data.push(item);
                    if(item.price < coinData.min) {
                        coinData.min = item.price;
                    }
                    if(item.price > coinData.max) {
                        coinData.max = item.price;
                    }
                }
            });

            data.sort(function(a, b) {
                return a.price - b.price;
            });
            coinData.order = order;
            coinData.coinID = coinID;
            coinData.san = data;
            coinData.diff = coinData.max / coinData.min;
            allData.push(coinData);

            callback();
        }
    });
}
var tasks = [];
var coinIDs = [];
var count = 0;

function addCoin(html1) {
    var $ = cheerio.load(html1);

    $('tr', '#currencies').each(function(i, row){
        var temp = $(row).attr('id');
        if(temp !== undefined) {
            var cID = temp.replace('id-', '');

            if(cID != 'bitcoin' && cID != 'ethereum') {
                coinIDs.push(cID);
                var myIndex = count;
                tasks[myIndex ] = function(cb, funcIndex) {
                    checkCoin(cID, myIndex, cb);
                };
                ++count;
            }
        }
    });
};

//var task2 = [];
//for(var k = 1; k < 3; ++k){
//
//    task2[k-1] = function(cb, funcIndex) {
//        request('https://coinmarketcap.com/' + k, function (error1, response1, html1) {
//            addCoin(html1);
//            cb();
//        });
//    }
//}
//sequenty.run(task2).then(sequenty.run(tasks));

    request('https://coinmarketcap.com/', function (error1, response1, html1) {
        addCoin(html1);

        request('https://coinmarketcap.com/2', function (error1, response1, html1) {
            addCoin(html1);

            //request('https://coinmarketcap.com/3', function (error1, response1, html1) {
            //    addCoin(html1);
            tasks.push(function(cb, index) {

                allData.sort(function(a, b) {
                   return a.diff - b.diff;
                });
                allData.reverse();

                for (var k = 0, len1 = allData.length; k < len1; k++) {
                    var data = allData[k];

                    console.log(data.order + ': ========= ' + data.coinID + ' ========= min: '
                        + data.min + ' ========= max: ' + data.max + ' ========= diff: '
                        + data.diff);

                    for (var i = 0, len = data.san.length; i < len; i++) {
                        var coin = data.san[i];
                        console.log(i + ": " + coin.san + coin.price);
                    }
                    console.log('========= end =========');
                }
                cb();
            });
            sequenty.run(tasks);
            //});
        });
    });






