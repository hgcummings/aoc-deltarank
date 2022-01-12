Firefox add-on / Chrome extension that shows a new [Delta score] option under the list of ordering 
methods on Advent of Code private leaderboards. To use it just click on [Ordering] on any private leaderboard page then click on [Delta score].

## Development

### Pre-requisites

```
npm install --global web-ext
```

### Testing

To test in Firefox (with live reload)

```
web-ext run
```

### Release

* Update manifest.json
* Run `web-ext build`
* Upload new version to <https://addons.mozilla.org/en-GB/developers/addons>
* Upload new version to <https://chrome.google.com/webstore/devconsole/> (Package -> Upload new package)