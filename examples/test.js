var request = require('request');
var cheerio = require('cheerio');

request('https://coinmarketcap.com/currencies/stellar/#markets', function (error, response, html) {
    if (!error && response.statusCode == 200) {

        var data = [];

        var $ = cheerio.load(html);
        $('tr', '#markets-table').each(function(i, row){
            //var a = $(this).prev();
            //console.log(a.text());

            var san = '';
            var isBTCPair = false;
            $('a', row).each(function(i, a) {
                var ref = $(a).attr('href');
                var text = $(a).text();
                san = san + ref + ' - ';

                if(text.includes('BTC')) {
                    isBTCPair = true;
                }
            });
            var price = $('span[class=price]', row).attr('data-btc');

            if(isBTCPair) {
                var item = {};
                item.san = san;
                item.price = price * 1;
                data.push(item);
                console.log(item.san + item.price);
            }
        });
    }
});