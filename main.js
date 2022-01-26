"use strict";

var msg = mp.msg;

var CryptoJS = {};
CryptoJS.AES = require('./crypto-js/aes');

// unescape() is used by CryptoJS, but the mpv's interpreter does not seem to have one.
var unescape = function(s) {
    return s.replace(/%(u[0-9a-f]{4}|[0-9a-f]{2})/ig, function(m) {
        return String.fromCodePoint(parseInt(m.substring((m.length > 3) + 1, m.length), 16))
    });
}

function edl_escape(s) {
    return '%' + s.length + '%' + s;
}

function decrypt_subs(s) {
    // Yanked from videoPlayer.production.min.js.
    return CryptoJS.AES.decrypt(
        s.substring(8, s.length - 5),
        s.substring(0, 8).split('').reverse().join('')
    ).toString();
}

function fetch(url, params) {
    params = params || {};
    var ret = mp.command_native({
        name: 'subprocess',
        capture_stdout: true,
        capture_stderr: true,
        args: ['curl', '-fsS', url].concat((function(params) {
            var args = [];
            // TODO: May be do it automatically with map {'someKey':'--some-arument',...}.
            if (params.userAgent)
                args.push('-A', params.userAgent);
            return args;
        })(params))
    });
    return ret.status == 0 ? ret.stdout : {error: ret.stderr};
}

// Run before youtube-dl hook just in case.
mp.add_hook('on_load', 50, function() {
    var filename = mp.get_property_native('stream-open-filename')
    if (typeof(filename) !== 'string')
		return;

    var id = (filename.match(/^https?:\/\/animelon\.com\/video\/(\w+)/) || [])[1];
    if (!id)
		return;

    msg.log('info', 'Animelon video url detected, fetching...');
    
    var page = fetch(filename);

    if (page.error) {
        msg.log('fatal', page.error);
        return;
    }

    var stream = (page.match(/<video\s+src="([^"]+)"/) || [])[1];
    var title = (page.match(/<h1>(.*)<\/h1>/) || [])[1];

    if (!stream) {
        msg.log('fatal', 'Failed to acquire video stream url');
        return;
    }

    msg.log('info', 'Acquired video stream url: ' + stream);
    mp.set_property('file-local-options/force-media-title', title);
    mp.set_property('stream-open-filename', stream);

    msg.log('info', 'Fetching subtitles...');

    var info = fetch('https://animelon.com/api/languagevideo/findByVideo?videoId=' + id + '&learnerLanguage=en&subs=1&cdnLink=1&viewCounter=1', {userAgent: 'Mozilla/5.0'});

    if (!info.error) {
        try {
            info = JSON.parse(info);
            if (typeof(info) !== 'object')
                throw 'Object expected as a response, got "' + typeof(info) + '"';
        } catch (err) {
            msg.log('debug', info);
            info = {error: 'Failed to parse response JSON: ' + err};
        }
    }

    if (info.error) {
        msg.log('error', 'Failed to load subtitles');
        msg.log('error', info.error);
    } else {
        try {
            info.resObj.subtitles.forEach(function(sub) {
                // TODO: Account for timeOffset of parsed subs.
                var lang = sub.title.match(/\b\w+$/)[0].substring(0, 2);
                msg.log('info', 'Adding subtitles [' + lang + '] "' + sub.type + '"');
                mp.commandv('sub-add', 'edl://!no_clip;!delay_open,media_type=sub;' + edl_escape('hex://' + decrypt_subs(sub.content[sub.type + 'Sub'])), 'auto', sub.type, lang);
            });
        } catch (err) {
            msg.log('error', 'Failed to parse subtitles');
            msg.log('error', err);
        }
    }

    msg.log('info', 'Now playing: ' + title);
});
