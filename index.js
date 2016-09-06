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
    console.log('id ====________________________________',data.id, data.metadata.title, '-------description------', Object.keys(data.metadata),'Data----------------------meta----------------------',data.metadata.meta ,'filename====' + data.name);
});
rssAdapter.addListener('data', function (data) {
   // console.log('downloading ' + '====' , typeof data.data,'-----------------%----------', data.name,'-----------------data.id-----------------',data.id,'====================Datat.data-------------------------------');
    writeStreams[data.id].write(JSON.stringify(data.data));
});

rssAdapter.addListener('done', function (data) {
    console.log('----- done -----');
    writeStreams[data.id].end();

});

rssAdapter.addListener('stop', function () {
    console.log('----- stopped -----');
    //roll through all write streams and stop them
});

rssAdapter.addListener('error', function (data) {
    console.log('----- Error -----');
    console.log(data);
});

rssAdapter.start();