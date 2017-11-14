TabStats = {};

// New Stats Object
var tabStatsStorage = {
    settings: {
        firstRun: true,
        firstRunDate: new Date(),
        showStats: true,
        showValue: "CURRENT",
        version: 2.0
    },
    stats: {
        totals: {
            created: 0,
            deleted: 0,
            duplicated: 0,
            muted: 0,
            pinned: 0,
            incognito: 0
        },
        longest: {
            time: 0,
            title: '',
            url: ''
        },
        current: {
            count: 0,
            date: new Date(),
            active: {
                id: -1,
                windowId: -1,
                url: '',
                title: '',
                startTime: 0,
            },
            duplicate: 0,
            muted: 0,
            pinned: 0,
            incognito: 0
        },
        tabs: {
            urls : []
        }
    }
};

TabStats.saveTabDetails = function(tab) {
    // Parse Domain name
    var removedProtocol = tab.url.replace(/https?:\/\//g, '');
    var urlSplit = removedProtocol.split(/[/?#]/);
    var domainUrl = urlSplit[0];

    if (TabStats.Storage.stats.hasOwnProperty("tabs") === false || TabStats.Storage.stats.tabs === false) {
        TabStats.Storage.stats.tabs = {};
    }

    // if (TabStats.Storage.stats.tabs.hasOwnProperty("urls") === false || TabStats.Storage.stats.tabs.urls === null) {
    //     TabStats.Storage.stats.tabs.urls = [];
    // }

    // Check if tab already existes
    if (TabStats.Storage.stats.tabs.urls.hasOwnProperty(domainUrl)) {
        var currentCount = TabStats.Storage.stats.tabs.urls[domainUrl].count + 1;

        TabStats.Storage.stats.tabs.urls[domainUrl].id = tab.id;
        TabStats.Storage.stats.tabs.urls[domainUrl].updated = new Date();
        TabStats.Storage.stats.tabs.urls[domainUrl].count = currentCount;
    } else {
        TabStats.Storage.stats.tabs.urls[domainUrl] = {
            id: tab.id,
            url: domainUrl,
            created: new Date(),
            count: 1
        };
    }

    TabStats.saveStats();
};















// Clear stats
TabStats.resetStats = function() {
    TabStats.Storage = tabStatsStorage;
};

TabStats.clearTotalDeleted = function() {
    TabStats.Storage.stats.totals.deleted = 0;
    TabStats.saveStats();
    TabStats.updateRender();
};

TabStats.clearLongestTab = function() {
    TabStats.Storage.stats.longest = tabStatsStorage.stats.longest;
    TabStats.saveStats();
    TabStats.updateRender();
};

var mutedTabs = [];
var pinnedTabs = [];
var incognitoTabs = [];
var tabArray = [];
var tabDupArray = [];

TabStats.init = function() {
	TabStats.checkFirstRun();

    chrome.extension.isAllowedIncognitoAccess(function(isAllowed) {
        TabStats.Storage.settings.allowedIncognito = isAllowed;
    });

    // Tab Event Listeners
	chrome.tabs.onCreated.addListener(TabStats.onNewTab);
	chrome.tabs.onRemoved.addListener(TabStats.onCloseTab);
    chrome.tabs.onActivated.addListener(TabStats.onActiveTabChange);
    chrome.tabs.onUpdated.addListener(TabStats.onUpdatedTab);

    // Get Current Tab Count
    chrome.windows.getAll({populate: true}, function (windows) {
        TabStats.Storage.stats.current.count = 0;
        TabStats.Storage.stats.current.muted = 0;
        TabStats.Storage.stats.current.pinned = 0;
        TabStats.Storage.stats.current.incognito = 0;

        for(var i = 0; i < windows.length; i++) {
            TabStats.Storage.stats.current.count += windows[i].tabs.length;

            for(var j = 0; j < windows[i].tabs.length; j++) {
                // console.log(windows[i].tabs[j]);
                // Check to see if any tabs are muted
                if (windows[i].tabs[j].mutedInfo.muted) {
                    TabStats.Storage.stats.current.muted++;
                    mutedTabs.push(windows[i].tabs[j].id);
                }

                if (windows[i].tabs[j].pinned) {
                    TabStats.Storage.stats.current.pinned++;
                    pinnedTabs.push(windows[i].tabs[j].id);
                }

                if (TabStats.Storage.settings.allowedIncognito && windows[i].tabs[j].incognito) {
                    TabStats.Storage.stats.current.incognito++;
                    incognitoTabs.push(windows[i].tabs[j].id);
                }

                if (tabDupArray.indexOf(windows[i].tabs[j].id) === -1) {
                    tabArray.push({title: windows[i].tabs[j].title, id: windows[i].tabs[j].id});
                    tabDupArray.push(windows[i].tabs[j].id);
                }
            }
        }
        TabStats.checkDupes(false);
        TabStats.updateRender();
    });
};

TabStats.dayChangeResetter = function() {

    var now = new Date();

    // Reset daily counter on a new day
	if (now.getDate() != TabStats.dailyDate.getDate()) {
		TabStats.Stats.daily.created = 0;
		TabStats.Stats.daily.deleted = 0;
		TabStats.dailyDate = now;
	}
};

TabStats.clearStats = function() {
    localStorage.setItem("TabStats", JSON.stringify(tabStatsStorage));
};

TabStats.onUpdatedTab = function(tabId, changedInfo, tab) {
    // console.log(tabId, changedInfo, tab);
    // If it muted the tab
    if (typeof changedInfo.mutedInfo !== "undefined") {
        if (changedInfo.mutedInfo.muted) {
            TabStats.Storage.stats.totals.muted++;
            TabStats.Storage.stats.current.muted++;
            mutedTabs.push(tabId);
        }
        else {
            var index = mutedTabs.indexOf(tabId);
            if (index > -1) {
                mutedTabs.splice(index, 1);
            }
        }
    }

    if (tab.pinned) {
        TabStats.Storage.stats.totals.pinned++;
        TabStats.Storage.stats.current.pinned++;
        pinnedTabs.push(tabId);
    }
    else {
        var index = pinnedTabs.indexOf(tabId);
        if (index > -1) {
            pinnedTabs.splice(index, 1);
        }
    }

    TabStats.Storage.stats.current.muted = mutedTabs.length;
    TabStats.Storage.stats.current.pinned = pinnedTabs.length;

    if  (typeof changedInfo.status !== "undefined" && changedInfo.status === "complete") {
        TabStats.saveTabDetails(tab);
    }

    TabStats.saveStats();
    TabStats.updateRender();
};

TabStats.onNewTab = function(tab) {
    TabStats.Storage.stats.current.count++;
    TabStats.Storage.stats.totals.created++;

    if (TabStats.Storage.settings.allowedIncognito && tab.incognito) {
        TabStats.Storage.stats.totals.incognito++;
        TabStats.Storage.stats.current.incognito++;
        incognitoTabs.push(tab.id);
    }

    if (tabDupArray.indexOf(tab.id) === -1) {
        tabArray.push({title: tab.title, id: tab.id});
        tabDupArray.push(tab.id);
    }

    TabStats.saveTabDetails(tab);

	// TabStats.dayChangeResetter();

    TabStats.checkDupes(true);

    TabStats.updateRender();
	TabStats.saveStats();
};

TabStats.onCloseTab = function(tab) {
   TabStats.Storage.stats.current.count--;
   TabStats.Storage.stats.totals.deleted++;

   var index = pinnedTabs.indexOf(tab);
   if (index > -1) {
       TabStats.Storage.stats.current.pinned--;
       pinnedTabs.splice(index, 1);
   }

   index = incognitoTabs.indexOf(tab);
   if (index > -1) {
       TabStats.Storage.stats.current.incognito--;
       incognitoTabs.splice(index, 1);
   }

   index = tabDupArray.indexOf(tab);
   if (index > -1) {
       TabStats.Storage.stats.current.duplicate--;
       tabArray.splice(index, 1);
       tabDupArray.splice(index, 1);
   }

   // TabStats.dayChangeResetter();
   TabStats.Storage.stats.current.pinned = pinnedTabs.length;
   TabStats.Storage.stats.current.incognito = incognitoTabs.length;

   TabStats.saveStats();
   TabStats.updateRender();
};

TabStats.setLongestTabFromActive = function(totalTime) {
    TabStats.Storage.stats.longest = {
        time: totalTime,
        title: TabStats.Storage.stats.current.active.title,
        url: TabStats.Storage.stats.current.active.url
    };
};

TabStats.onActiveTabChange = function(activeInfo) {
    var totalTime = -1;

	if (activeInfo.windowId === TabStats.Storage.stats.current.active.windowId) { // Ensure we only track the current window

        // If its not a brand new tab and is different from last check
		if (TabStats.Storage.stats.current.active.id !== -1 && activeInfo.tabId !== TabStats.Storage.stats.current.active.id) {

            TabStats.storeActiveTabData(activeInfo);

            // Calculate delta since first hit
			totalTime = Date.now() - TabStats.Storage.stats.current.active.startTime;

            // Check to see if it beats the longest tab time
			if (totalTime > TabStats.Storage.stats.longest.time) {
                TabStats.setLongestTabFromActive(totalTime);
                TabStats.Storage.stats.current.active.startTime = Date.now();
			}
		} else {
            TabStats.Storage.stats.current.active.id = activeInfo.tabId;
            TabStats.storeActiveTabData(activeInfo);
        }
	} else {
        TabStats.storeActiveTabData(activeInfo);
    }

    TabStats.saveStats();
};

TabStats.storeActiveTabData = function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab){
        TabStats.Storage.stats.current.active = {
            startTime: Date.now(),
            title: tab.title,
            url: tab.url,
            windowId: activeInfo.windowId,
            id: activeInfo.tabId
        };
    });
};

TabStats.isFirstRun = function() {
    return (window.localStorage.getItem("TabStats") === null ? true : false);
};

TabStats.checkFirstRun = function() {
    if (TabStats.isFirstRun()) {
        TabStats.Storage = tabStatsStorage;
        TabStats.saveStats();
    } else {
        TabStats.Storage = JSON.parse(localStorage.getItem("TabStats"));
    }
};

TabStats.saveStats = function() {
    localStorage.setItem("TabStats", JSON.stringify(TabStats.Storage));
};

TabStats.updateRender = function() {

    if (TabStats.Storage.settings.showStats === false) {
        chrome.browserAction.setBadgeText({text: ''}); // Show empty string
        return false;
    } else {

    	switch(TabStats.Storage.settings.showValue) {

    		// Current Count
    		case "CURRENT":
                updateBrowserBadge(
                    numberOutput(TabStats.Storage.stats.current.count),
                    'TabStats - ' + TabStats.Storage.stats.current.count + ' tabs currently open',
                     "#5885E4"
                );
		          break;

    		// Total Created
    		case "CREATED":
                updateBrowserBadge(
                    numberOutput(TabStats.Storage.stats.totals.created),
                    'TabStats - ' + TabStats.Storage.stats.totals.created + ' tabs created',
                     "#4E9C4E"
                );
	          break;

    		// Total Deleted
    		case "DELETED":
                updateBrowserBadge(
                    numberOutput(TabStats.Storage.stats.totals.deleted),
                    'TabStats - ' + TabStats.Storage.stats.totals.deleted + ' tabs deleted',
                     "#CF1E1E"
                );
               break;

           // Total Deleted
       		case "MUTED":
                   updateBrowserBadge(
                       numberOutput(TabStats.Storage.stats.current.muted),
                       'TabStats - ' + TabStats.Storage.stats.current.muted + ' tabs currently muted',
                        "#888888"
                   );
                  break;

            default:
                updateBrowserBadge(
                    numberOutput(TabStats.Storage.stats.current.count),
                    'TabStats - ' + TabStats.Storage.stats.current.count + ' tabs currently open',
                     "#5885E4"
                );
                break;
        }
	}
};

function updateBrowserBadge(text, title, color) {
    chrome.browserAction.setBadgeText({text: text.toString()});
    chrome.browserAction.setTitle({title: title});
    chrome.browserAction.setBadgeBackgroundColor({color: color});
}

function numberOutput(val) {
    return (val > 1000 ? (val /1000).toFixed(1) + 'k' : val);
}

// Count up the dupes
TabStats.checkDupes = function(addToTotal, cb) {
    counter = {};
    dupes = 0;
    TabStats.Storage.stats.current.duplicate = 0;

    var counts = {};
    tabArray.forEach(function(x) { counts[x.title] = (counts[x.title] || 0) + 1; });

    Object.keys(counts).forEach(function(key) {
        if (counts[key] > 1) dupes += counts[key];
    });

    TabStats.Storage.stats.current.duplicate = (dupes > 0 ? dupes -= 1 : 0);

    if (addToTotal) {
        TabStats.Storage.stats.totals.duplicated++;
    }
    TabStats.updateRender();
    TabStats.saveStats();

    if (cb) cb();
};

// Call init on load
window.addEventListener("load", TabStats.init, false);
