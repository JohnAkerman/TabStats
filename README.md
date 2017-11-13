<p align="center">
  <img src="https://raw.githubusercontent.com/JohnAkerman/TabStats/master/img/tabstats-128.png" alt="TabStats Logo." />
  <h3 align="center">TabStats</h3>
  <h4 align="center">Accumulates statistics of your tab usage based on your behaviour</h4>
</p>

<p align="center"><a href="https://github.com/JohnAkerman/TabStats/blob/master/LICENSE" class="rich-diff-level-one"><img src="https://camo.githubusercontent.com/db8bc74c0b580d34907807215172fd3ab2de23e3/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6c6963656e73652f4a6f686e416b65726d616e2f54616253746174732e737667" alt="GitHub license" data-canonical-src="https://img.shields.io/github/license/JohnAkerman/TabStats.svg" style="max-width:100%;"></a>&nbsp;&nbsp; <a href="https://github.com/JohnAkerman/TabStats/issues" class="rich-diff-level-one"><img src="https://camo.githubusercontent.com/ea42072de61a84afb055cec5d324a773115611eb/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6973737565732f4a6f686e416b65726d616e2f54616253746174732e737667" alt="GitHub issues" data-canonical-src="https://img.shields.io/github/issues/JohnAkerman/TabStats.svg" style="max-width:100%;"></a> <a href="https://github.com/JohnAkerman/TabStats/issues?q=is%3Aissue+is%3Aclosed" class="rich-diff-level-one"><img src="https://camo.githubusercontent.com/4aaa819c50c01df983b1d328f2d375be34b2d5f5/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6973737565732d636c6f7365642f4a6f686e416b65726d616e2f54616253746174732e737667" alt="GitHub closed issues" data-canonical-src="https://img.shields.io/github/issues-closed/JohnAkerman/TabStats.svg" style="max-width:100%;"></a> <a href="https://github.com/JohnAkerman/TabStats/pulls?q=is%3Apr+is%3Aclosed" class="rich-diff-level-one"><img src="https://camo.githubusercontent.com/c6ec9ca1741c9e46c18e440942fbddc2b5b17a76/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6973737565732d70722d636c6f7365642f4a6f686e416b65726d616e2f54616253746174732e737667" alt="GitHub closed pull requests" data-canonical-src="https://img.shields.io/github/issues-pr-closed/JohnAkerman/TabStats.svg" style="max-width:100%;"></a> <a href="https://github.com/JohnAkerman/TabStats/issues" class="rich-diff-level-one"><img src="https://camo.githubusercontent.com/926d8ca67df15de5bd1abac234c0603d94f66c00/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f636f6e747269627574696f6e732d77656c636f6d652d627269676874677265656e2e7376673f7374796c653d666c6174" alt="contributions welcome" data-canonical-src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat" style="max-width:100%;"></a></p>

***

## What is TabStats?
TabStats is a Chrome Extension that accumulates statistics of your tab usage based on your behaviour and presents them to you in a easy to use popup. **We do not store or send any of your page history**

![Example screenshot](https://raw.githubusercontent.com/JohnAkerman/TabStats/master/img/screenshot.png)


### Stats Tracked
The current list of stats tracked, this includes the current amount and total since installation.

Name | Type | Description
--- | :---: | ---
Current Window | *Current* | Open on the currently active window.
All Windows | *Current* | Open across all browser windows.
Created | *Total* | New tabs created.
Duplicate | *Current / Total* | Tabs you currently have open where the URL matches causing duplicates.
Muted | *Current / Total* | Tabs that have been muted.
Incognito | *Current / Total* | Open tabs running in incognito mode *if extension is allowed to run when in incognito mode*.
Pinned | *Current / Total* | Tabs that have been pinned by the user.
Deleted | *Total* | Number of tabs deleted.

## Install
The current version is not yet on the Chrome Web Store and therefore you will need to install an unpacked version instead. need to be installed as a developer extension. Instructions from the [developer website](https://developer.chrome.com/extensions/getstarted#unpacked):
1. Visit ``chrome://extensions`` in your browser (or open up the Chrome menu by clicking the icon to the far right of the Omnibox:  ![The menu's icon is three horizontal bars.](https://developer.chrome.com/static/images/hotdogmenu.png) and select **Extensions** under the **More Tools** menu to get to the same place).

2. Ensure that the **Developer mode** checkbox in the top right-hand corner is checked.

3. Click **Load unpacked extension…** to pop up a file-selection dialog.

Navigate to the directory in which your extension files live, and select it.

Alternatively, you can drag and drop the directory where your extension files live onto chrome://extensions in your browser to load it.

## Documentation
- [Found a bug?](https://github.com/JohnAkerman/TabStats/issues)
- [Project Status](https://github.com/JohnAkerman/TabStats/projects/1)

## Contributing
Contributes are welcome on this project, please read the [Contributing document](https://github.com/JohnAkerman/TabStats/blob/master/CONTRIBUTING.md) for further information.
## License
[MIT License](https://opensource.org/licenses/MIT)
