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
            muted: 0
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
            muted: 0
        }
    }
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

TabStats.init = function() {
	TabStats.checkFirstRun();

    // Tab Event Listeners
	chrome.tabs.onCreated.addListener(TabStats.onNewTab);
	chrome.tabs.onRemoved.addListener(TabStats.onCloseTab);
    chrome.tabs.onActivated.addListener(TabStats.onActiveTabChange);
    chrome.tabs.onUpdated.addListener(TabStats.onUpdatedTab);

    // Get Current Tab Count
    chrome.windows.getAll({populate: true}, function (windows) {
        TabStats.Storage.stats.current.count = 0;
        TabStats.Storage.stats.current.muted = 0;

        for(var i = 0; i < windows.length; i++) {
            TabStats.Storage.stats.current.count += windows[i].tabs.length;

            for(var j = 0; j < windows[i].tabs.length; j++) {

                // Check to see if any tabs are muted
                if (windows[i].tabs[j].mutedInfo.muted) {
                    TabStats.Storage.stats.current.muted++;
                    mutedTabs.push(windows[i].tabs[j].tabId);
                }
            }
        }
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

    TabStats.updatedMutedCount();
    TabStats.saveStats();
    TabStats.updateRender();
};

TabStats.updatedMutedCount = function() {
    TabStats.Storage.stats.current.muted = mutedTabs.length;
};

TabStats.onNewTab = function() {
    TabStats.Storage.stats.current.count++;
    TabStats.Storage.stats.totals.created++;

	// TabStats.dayChangeResetter();

    TabStats.updateRender();
	TabStats.saveStats();
};

TabStats.onCloseTab = function() {
   TabStats.Storage.stats.current.count--;
   TabStats.Storage.stats.totals.deleted++;

   // TabStats.dayChangeResetter();

   TabStats.updateRender();
   TabStats.saveStats();
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

TabStats.duplicateCheck = function(callback) {
    var tabArray = Array();
    chrome.windows.getAll({populate: true}, function (windows) {
        for(var i = 0; i < windows.length; i++) {
            for(var j = 0; j < windows[i].tabs.length; j++) {
                tabArray.push(windows[i].tabs[j].title);
            }
        }
        checkDupes(tabArray);
        callback();
    });
};

// Count up the dupes
function checkDupes(tabArray) {
    counter = {};
    dupes = 0;
    tabArray.forEach(function(obj) {
        var key = JSON.stringify(obj);
        counter[key] = (counter[key] || 0) + 1;
        dupes += (counter[key] - 1);
    });
    TabStats.Storage.stats.totals.duplicated += dupes;
    TabStats.Storage.stats.current.duplicate = dupes;
    TabStats.saveStats();
}

// Call init on load
window.addEventListener("load", TabStats.init, false);
