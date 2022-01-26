# mpv-animelon
A (relatively) simple mpv script to open [Animelon](https://animelon.com/) video URLs written in Javascript.

## Installation and usage
`git clone` the repository into your local mpv's `scripts` directory.
This script uses `curl` to fetch content. Make sure it is installed on your system.
Now you should be able to open Animelon video links in mpv and the subtitles should be available as well (no subtitles may be selected by default though).

## FAQ

### Why is this script not a [youtube-dl](https://github.com/ytdl-org/youtube-dl)/[yt-dlp](https://github.com/yt-dlp/yt-dlp) extractor instead?
There are a couple of reasons for that.
1. Extractors for such sites can be against youtube-dl policy as described in its [FAQ](https://github.com/ytdl-org/youtube-dl/blob/master/README.md#can-you-add-support-for-this-anime-video-site-or-site-which-shows-current-movies-for-free)
   and [contributing guide](https://github.com/ytdl-org/youtube-dl/blob/master/CONTRIBUTING.md#adding-support-for-a-new-site).
   If this was not the case, someone would have already done it, I believe.
2. I just wanted a way to watch videos from the site with subtitles in mpv.
   Writing a fully-featured youtube-dl extractor for that would have been probably a lot harder,
   given that the subtitles are encrypted using AES and therefore the extractor would have needed a cryptography library as a dependency.

If you want, you can try to turn this into one and submit a patch to yt-dlp,
but I think there is a high chance that it will be rejected.

Alternatively someone could write a stand-alone extractor and maintain it as a patch
or even create a yet another youtube-dl fork with this extractor included,
but I personally am not interested in that either.

### Why is it written in Javascript?
That was the easiest way to get cryptography working as intended.
Besides, I have never written an mpv script in JS before, and this was a nice chance to try.
Maybe someday I or someone else will rewrite this thing in Lua, but at the end of the day the language does not matter anyway.

## License
The script itself is under [UNLICENSE](http://unlicense.org/) (see [LICENSE](LICENSE)),
however it currently contains [parts of crypto-js](crypto-js) library [licensed under MIT](crypto-js/LICENSE).
