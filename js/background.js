TabStats = {};

// TabStats.currentCount = 0;
// TabStats.totalCreated = 0;
// TabStats.totalDeleted = 0;
// TabStats.showValue = 1;

// TabStats.dailyCreatedCount = 0;
// TabStats.dailyDeletedCount = 0;

//Note this is the active tab for the current window

// TabStats.activeTabId = -1;
// TabStats.activeTabTitle = "";
// TabStats.activeTabUrl = "";
// TabStats.windowIdOfActiveTab = -1;

// TabStats.longestTimeOnTab = 0; //milliseconds
// TabStats.longestTimeOnTabTitle = "";
// TabStats.longestTimeOnTabUrl = "";

// TabStats.duplicateCount = 0;

// New Stats Object
TabStats.Stats = {
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
}

// Settings Object
TabStats.Settings = {
    "showValue" : 1
}

TabStats.init = function() {
	TabStats.checkFirstRun();

	chrome.tabs.onCreated.addListener(TabStats.onNewTab);
	chrome.tabs.onRemoved.addListener(TabStats.onCloseTab);
    chrome.tabs.onActivated.addListener(TabStats.onActiveTabChange);
	localStorage.setItem('Settings.showValue', TabStats.Settings.showValue);
    TabStats.renderValue();
}

TabStats.dayChangeResetter = function() {

    var now = new Date();

    // Reset daily counter on a new day
	if (now.getDate() != TabStats.dailyDate.getDate()) {
		TabStats.Stats.daily.created = 0;
		TabStats.Stats.daily.deleted = 0;
		TabStats.dailyDate = now;		
	}
}

TabStats.clearStats = function() {
	localStorage.setItem("Stats.total.created", 0);
	localStorage.setItem("Stats.total.deleted", 0);
    localStorage.setItem('Stats.daily.created', 0);
    localStorage.setItem('Stats.dailyDate', 0);

    // Reset longest
    localStorage.setItem('Stats.longest.tab.time', 0);
    localStorage.setItem('Stats.longest.tab.title', 0);
	localStorage.setItem('Stats.longest.tab.url', 0);
}

TabStats.onNewTab = function() {
    TabStats.Stats.currentCount++;
	TabStats.Stats.total.created++;
	
	TabStats.dayChangeResetter();
	
	TabStats.dailyCreatedCount++;

    TabStats.renderValue();
	
	TabStats.saveStats();
}

TabStats.onCloseTab = function() {
   TabStats.Stats.currentCount--;
   TabStats.Stats.total.deleted++;
   
   TabStats.dayChangeResetter();

   TabStats.dailyDeletedCount++;
   
   TabStats.renderValue();
   
   TabStats.saveStats();
} 

TabStats.onActiveTabChange = function(activeInfo) {
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
}

TabStats.checkFirstRun = function() {
	if (!window.localStorage.getItem("Settings.firstRun")) {
		TabStats.firstRun();
	}
	TabStats.loadStats();
    TabStats.dailyDate = new Date(localStorage.getItem('dailyDate'));
}

TabStats.firstRun = function() {
    localStorage.setItem('Settings.firstRun', 'true');
    localStorage.setItem('Settings.firstRunDate', new Date());
    localStorage.setItem("Settings.showStat", 'true');
    localStorage.setItem("Stats.total.created", 0);
    localStorage.setItem("Stats.total.deleted", 0);
    localStorage.setItem('Stats.daily.created', 0);
    localStorage.setItem('dailyDate', new Date());
	localStorage.setItem('Stats.longest.tab.time', 0);
	localStorage.setItem('Stats.longest.tab.title', "");
	localStorage.setItem('Stats.longest.tab.url', "");
}

TabStats.loadStats = function() {
    if (localStorage.getItem("firstRun")) {
        TabStats.Stats.total.created = parseInt(localStorage.getItem("Stats.total.created"), 10);
        TabStats.Stats.total.deleted = parseInt(localStorage.getItem("Stats.total.deleted"), 10);
        TabStats.Stats.daily.created = parseInt(localStorage.getItem("Stats.daily.created"), 10);
		TabStats.Stats.longest.tab.time = parseInt(localStorage.getItem("Stats.longest.tab.time"), 10);
		TabStats.Stats.longest.tab.title = localStorage.getItem("Stats.longest.tab.title");
        TabStats.Stats.longest.tab.url = localStorage.getItem("Stats.longest.tab.url");
    }
}

TabStats.saveStats = function() {
    localStorage.setItem("Stats.total.created", TabStats.Stats.total.created);
    localStorage.setItem("Stats.total.deleted", TabStats.Stats.total.deleted);
    localStorage.setItem('Stats.daily.created', TabStats.Stats.daily.created);
    localStorage.setItem('dailyDate', TabStats.dailyDate);
	localStorage.setItem('Stats.longest.tab.time', TabStats.Stats.longest.tab.time);
	localStorage.setItem('Stats.longest.tab.title', TabStats.Stats.longest.tab.title);
    localStorage.setItem('Stats.longest.tab.url', TabStats.Stats.longest.tab.url);
}

TabStats.thousandCheck = function(val) {
    return (val > 1000 ? (val /1000).toFixed(1) + 'k' : val);
}

TabStats.renderValue = function() {
	TabStats.Settings.showValue = parseInt(localStorage.getItem("Settings.showValue"), 10);

    TabStats.Settings.shouldShow = localStorage.getItem("Settings.showStat");

    if (TabStats.Settings.shouldShow == "true") {
		switch(TabStats.Settings.showValue) {

			// Current Count
			case 1: 
	   			chrome.browserAction.setBadgeText({text: TabStats.thousandCheck(TabStats.Stats.currentCount) + ''});
	   			chrome.browserAction.setBadgeBackgroundColor({color: "#5885E4"});
	   			chrome.browserAction.setTitle({title: 'TabStats - ' + TabStats.Stats.currentCount + ' tabs currently open'});
			break;

			// Total Created
			case 2:
	   			chrome.browserAction.setBadgeText({text: TabStats.thousandCheck(TabStats.Stats.total.created) + ''});
	   			chrome.browserAction.setBadgeBackgroundColor({color: "#4E9C4E"});
	   			chrome.browserAction.setTitle({title: 'TabStats - ' + TabStats.Stats.total.created + ' tabs created total'});
			break;
			
			// Total Deleted
			case 3:
			    chrome.browserAction.setBadgeText({text: TabStats.thousandCheck(TabStats.Stats.total.deleted) + ''});
	   			chrome.browserAction.setBadgeBackgroundColor({color: "#CF1E1E"});
	   			chrome.browserAction.setTitle({title: 'TabStats - ' + TabStats.Stats.total.deleted + ' tabs deleted total'});
			break;
		}
	} else {
	    chrome.browserAction.setBadgeText({text: ''}); // Show empty string
	}
}

// Call init on load
window.addEventListener("load", TabStats.init, false);

tabArray = Array();
chrome.windows.getAll({populate: true}, function (windows) {
    for(var i = 0; i < windows.length; i++) {
        TabStats.Stats.currentCount += windows[i].tabs.length;
        TabStats.renderValue();
    }
});

TabStats.duplicateCheck = function(callback) {
    tabArray = Array();
    chrome.windows.getAll({populate: true}, function (windows) {
        for(var i = 0; i < windows.length; i++) {
            for(var j = 0; j < windows[i].tabs.length; j++) {
                tabArray.push(windows[i].tabs[j].title);                
            }
        }
        checkDupes(tabArray);
        callback();
    });
}

// Count up the dupes
function checkDupes(tabArray) {
    counter = {}
    dupes = 0;
    tabArray.forEach(function(obj) {
        var key = JSON.stringify(obj)
        counter[key] = (counter[key] || 0) + 1
        dupes += (counter[key] - 1);
    });
    TabStats.Stats.duplicateCount = dupes;
    TabStats.saveStats();
}
