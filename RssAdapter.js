var util = require('util');
var EventEmitter = require('events').EventEmitter;
var FeedParser = require('feedparser')
    , request = require('request');
/**
 * Initialize RssAdapter
 * @param config
 * @constructor
 */
function RssAdapter(config) {
    this.stopped = false;
    this.validateConfigProperties(config);
    EventEmitter.call(this);
    this.urls = config.urls;
}

util.inherits(RssAdapter, EventEmitter);

/**
 * validate config file
 * @param config file.

 */
RssAdapter.prototype.validateConfigProperties = function validateConfigProperties(config) {
    if (!config) {
        console.error(config);
        throw new Error('no configuration found');
    }

    if (!config.urls) {
        console.error(config);
        throw new Error('urls not found in config file');
    }
    if (!(config.urls instanceof Array)) {
        console.error(config);
        throw new Error('urls not Array,urls must be Array');
    }

};
/**
 *  Start adapter
 */
RssAdapter.prototype.start = function start() {
    var self = this;
    var urls = self.urls;
    self.emit('start', {
        "urls": urls,
        "started": Date.now()
    });
    var options = [];// Optional arguments passed to feedParser.
    urls.forEach(function (url) {
        var title, meta, items = [];
        var req = request(url)
            , feedparser = new FeedParser(options);
        req.on('response', function (res) {
            var stream = this;
            if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
            stream.pipe(feedparser);
        });
        req.on('error', function (error) {
            // handle any request errors
        });
        feedparser.on('meta', function (info) {
            title = info && info.title && info.title.split('/').join('');
            if (title) {
                self.emit('stream', {"id": title + ".json", "started": Date.now(), "name": url});
                self.emit('metadata', {"id": title + ".json", "metadata": info, "name": url});
            }
        });
        feedparser.on('readable', function () {
            var stream = this
                , item;
            meta = stream.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
            while (item = stream.read()) {
                items.push(item);
            }
        });
        feedparser.on('end', function () {
            if (title)
                self.emit('done', {
                    "id": title + ".json",
                    "stopped": Date.now(),
                    "items": items
                });
        });
        feedparser.on('error', function (error) {
            if (title)
                self.emit('done', {
                    "id": title + ".json",
                    "stopped": Date.now(),
                    "items": items
                });
            console.error('error occurred -----------------------------', error);
        });
    })
};
/**
 *  stop adapter
 */
RssAdapter.prototype.stop = function stop() {
    var self = this;
    if (self.stopped) {
        return;
    }
    self.urls = null;
    self.stopped = true;
    self.emit('stop', {
        "stopped": Date.now(),
        "data": null
    });
};
RssAdapter.config = {
    "urls": {
        type: 'string',
        label: 'URL',
        input: 'text'
    }
};
module.exports = RssAdapter;