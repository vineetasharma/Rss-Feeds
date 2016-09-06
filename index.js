var config = require('./config.json');
var RssAdapter = require('./RssAdapter.js');
var rssAdapter = new RssAdapter(config);
var fs = require('fs');

var writeStreams = {};

rssAdapter.addListener('start', function () {
    console.log('----- Started -----');
});
rssAdapter.addListener('stream', function (data) {
    console.log('----- Stream -----');
    writeStreams[data.id] = fs.createWriteStream(data.id, {
        flags: 'w',
        encoding: "binary"
    });
    console.log(data);
});
rssAdapter.addListener('metadata', function (data) {
    // do something on metadata
});

rssAdapter.addListener('done', function (data) {
    console.log('----- done -----');
    writeStreams[data.id].write(JSON.stringify(data.items));
    writeStreams[data.id].end();

});

rssAdapter.addListener('stop', function () {
    console.log('----- stopped -----');
    //roll through all write streams and stop them
});

rssAdapter.addListener('error', function (error) {
    console.log('----- Error -----');
    console.error(error);
});

rssAdapter.start();