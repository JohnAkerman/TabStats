TabStats = {};

// New Stats Object
TabStats.OriginalStats = {
    "activeTab": {
        "id" : -1,
        "windowId" : -1,
        "url" : "",
        "title" : "",
        "StartDateInMs" :0
    },
    "longest" : {
        "tab": {
            "time" : 0,
            "url" : "",
            "title" : ""
        }
    },
    "daily" : {
        "created": 0,
        "deleted": 0
    },
    "total" : {
        "created": 0,
        "deleted": 0
    },
    "duplicateCount" : 0,
    "currentCount" : 0,
};

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
            duplicated: 0
        },
        longest: {
            time: 0,
            title: '',
            url: ''
        },
        current: {
            count: 0,
            date: new Date(),
            activeTab: {
                id: -1,
                windowId: -1,
                url: '',
                title: '',
                startTime: 0,
            },
            duplicate: 0
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

TabStats.init = function() {
	TabStats.checkFirstRun();

    // Tab Event Listeners
	chrome.tabs.onCreated.addListener(TabStats.onNewTab);
	chrome.tabs.onRemoved.addListener(TabStats.onCloseTab);
    chrome.tabs.onActivated.addListener(TabStats.onActiveTabChange);

    // Get Current Tab Count
    chrome.windows.getAll({populate: true}, function (windows) {
        TabStats.Storage.stats.current.count = 0;
        for(var i = 0; i < windows.length; i++) {
            TabStats.Storage.stats.current.count += windows[i].tabs.length;
            TabStats.updateRender();
        }
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

TabStats.onActiveTabChange = function(activeInfo) {
    return;
	if(activeInfo.windowId == TabStats.Stats.activeTab.windowId) {
		if(TabStats.Stats.activeTab.id != -1) {
			if(activeInfo.tabId != TabStats.Stats.activeTab.id) {
				totalTimeOnActiveTab = Date.now() - TabStats.Stats.activeTab.StartDateInMs; //milliseconds
				if(totalTimeOnActiveTab > TabStats.Stats.longest.tab.time) {
					TabStats.Stats.longest.tab.time = totalTimeOnActiveTab;
					TabStats.Stats.longest.tab.title = TabStats.activeTabTitle;
					TabStats.Stats.longest.tab.url = TabStats.activeTabUrl;
                    TabStats.Stats.activeTab.StartDateInMs = Date.now(); //milliseconds
					TabStats.saveStats();
				}
			}
		}
		else {
			TabStats.Stats.activeTab.StartDateInMs = Date.now(); //milliseconds
		}
		TabStats.Stats.activeTab.id = activeInfo.tabId;
		chrome.tabs.get(activeInfo.tabId, function (tab){
            TabStats.Stats.activeTab.title = tab.title;
            TabStats.Stats.activeTab.url = tab.url;
		});
	}
	else {
	    TabStats.Stats.activeTab.StartDateInMs = Date.now(); //milliseconds
		TabStats.Stats.activeTab.windowId = activeInfo.windowId;
		TabStats.Stats.activeTab.id = activeInfo.tabId;
		chrome.tabs.get(activeInfo.tabId, function (tab){
            TabStats.Stats.activeTab.title = tab.title;
            TabStats.Stats.activeTab.url = tab.url;
        });
	}
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
    TabStats.Storage.stats.totals.duplicate += dupes;
    TabStats.Storage.stats.current.duplicate = dupes;
    TabStats.saveStats();
}

// Call init on load
window.addEventListener("load", TabStats.init, false);
