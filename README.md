# TabStats
![TabStats Logo](https://raw.githubusercontent.com/JohnAkerman/TabStats/master/img/tabstats-128.png)


[![GitHub license](https://img.shields.io/github/license/JohnAkerman/TabStats.svg)](https://github.com/JohnAkerman/TabStats/blob/master/LICENSE)&nbsp;&nbsp;
[![GitHub issues](https://img.shields.io/github/issues/JohnAkerman/TabStats.svg)](https://github.com/JohnAkerman/TabStats/issues)
[![GitHub closed issues](https://img.shields.io/github/issues-closed/JohnAkerman/TabStats.svg)](https://github.com/JohnAkerman/TabStats/issues?q=is%3Aissue+is%3Aclosed)
[![GitHub closed pull requests](https://img.shields.io/github/issues-pr-closed/JohnAkerman/TabStats.svg)](https://github.com/JohnAkerman/TabStats/pulls?q=is%3Apr+is%3Aclosed)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/JohnAkerman/TabStats/issues)


## What is TabStats?
TabStats is a Chrome Extension that accumulates statistics of your tab usage based on your behaviour and presents them to you in a easy to use popup. **We do not store or send any of your page history**

![Example screenshot](https://raw.githubusercontent.com/JohnAkerman/TabStats/master/img/screenshot.png)

## Install
The current version is not yet on the Chrome Web Store and therefore you will need to install an unpacked version instead. need to be installed as a developer extension. Instructions from the [developer website](https://developer.chrome.com/extensions/getstarted#unpacked):
1. Visit ``chrome://extensions`` in your browser (or open up the Chrome menu by clicking the icon to the far right of the Omnibox:  ![The menu's icon is three horizontal bars.](https://developer.chrome.com/static/images/hotdogmenu.png) and select **Extensions** under the **More Tools** menu to get to the same place).

2. Ensure that the **Developer mode** checkbox in the top right-hand corner is checked.

3. Click **Load unpacked extension…** to pop up a file-selection dialog.

Navigate to the directory in which your extension files live, and select it.

Alternatively, you can drag and drop the directory where your extension files live onto chrome://extensions in your browser to load it.

### Stats Tracked
The current list of stats tracked:

Name | Description
---- | -----------
Current Window | Number of tabs open on the current window.
All Windows | Number of tabs across all windows.
Current Duplicate | Number of tabs currently open where you have duplicates where the URL matches.
Total Tabs Created | The total number of tabs opened since installation.
Total Tabs Deleted | The total number of tabs deleted since installation.
Total Duplicate Tabs | The total number of duplicated tabs since installation.

## Contributing
Contributes are welcome on this project, please read the [Contributing document](https://github.com/JohnAkerman/TabStats/blob/master/CONTRIBUTING.md) for further information.
## License
[MIT License](https://opensource.org/licenses/MIT)
