TabStats = {};

TabStats.currentCount = 0;
TabStats.totalCreated = 0;
TabStats.totalDeleted = 0;
TabStats.showValue = 1;

TabStats.dailyCreatedCount = 0;
TabStats.dailyDeletedCount = 0;

//Note this is the active tab for the current window
TabStats.activeTabId = -1;
TabStats.activeTabTitle = "";
TabStats.activeTabUrl = "";
TabStats.windowIdOfActiveTab = -1;

TabStats.longestTimeOnTab = 0; //milliseconds
TabStats.longestTimeOnTabTitle = "";
TabStats.longestTimeOnTabUrl = "";

TabStats.duplicateCount = 0;

TabStats.init = function() {
	TabStats.checkFirstRun();

	chrome.tabs.onCreated.addListener(TabStats.onNewTab);
	chrome.tabs.onRemoved.addListener(TabStats.onCloseTab);
    chrome.tabs.onActivated.addListener(TabStats.onActiveTabChange);
	localStorage.setItem('showValue', TabStats.showValue);
    TabStats.renderValue();
}

TabStats.dayChangeResetter = function() {

    var now = new Date();

    // Reset daily counter on a new day
	if (now.getDate() != TabStats.dailyDate.getDate()) {
		TabStats.dailyCreatedCount = 0;
		TabStats.dailyDeletedCount = 0;
		TabStats.dailyDate = now;		
	}
}

TabStats.clearStats = function() {
	localStorage.setItem("totalCreated", 0);
	localStorage.setItem("totalDeleted", 0);
    localStorage.setItem('dailyCount', 0);
    localStorage.setItem('dailyDate', 0);
	localStorage.setItem('longestTimeOnTab', 0);
}

TabStats.onNewTab = function() {
    TabStats.currentCount++;
	TabStats.totalCreated++;
	
	TabStats.dayChangeResetter();
	
	TabStats.dailyCreatedCount++;

    TabStats.renderValue();
	
	TabStats.saveStats();
}

TabStats.onCloseTab = function() {
   TabStats.currentCount--;
   TabStats.totalDeleted++;
   
   TabStats.dayChangeResetter();

   TabStats.dailyDeletedCount++;
   
   TabStats.renderValue();
   
   TabStats.saveStats();
} 

TabStats.onActiveTabChange = function(activeInfo) {
	if(activeInfo.windowId == TabStats.windowIdOfActiveTab) {
		if(TabStats.activeTabId != -1) {
			if(activeInfo.tabId != TabStats.activeTabId) {
				totalTimeOnActiveTab = Date.now() - TabStats.activeTabStartDateInMs; //milliseconds
				console.log("Total Time: " + totalTimeOnActiveTab);
				if(totalTimeOnActiveTab > TabStats.longestTimeOnTab) {
					console.log("New Longest Time On Tab: " + totalTimeOnActiveTab)
					TabStats.longestTimeOnTab = totalTimeOnActiveTab;
					TabStats.longestTimeOnTabTitle = TabStats.activeTabTitle;
					TabStats.longestTimeOnTabUrl = TabStats.activeTabUrl;
					TabStats.saveStats();
					TabStats.activeTabStartDateInMs = Date.now(); //milliseconds
				}
			}
		}
		else {
			TabStats.activeTabStartDateInMs = Date.now(); //milliseconds
		}
		TabStats.activeTabId = activeInfo.tabId;
		chrome.tabs.get(activeInfo.tabId, function (tab){
            TabStats.activeTabTitle = tab.title;
            TabStats.activeTabUrl = tab.url;
		});
	}
	else {
	    TabStats.activeTabStartDateInMs = Date.now(); //milliseconds
		TabStats.windowIdOfActiveTab = activeInfo.windowId;
		TabStats.activeTabId = activeInfo.tabId;
		chrome.tabs.get(activeInfo.tabId, function (tab){
            TabStats.activeTabTitle = tab.title;
            TabStats.activeTabUrl = tab.url;
        });
	}
}

TabStats.checkFirstRun = function() {
	if (!window.localStorage.getItem("firstRun")) {
		TabStats.firstRun();
	}
	TabStats.loadStats();
    TabStats.dailyDate = new Date(localStorage.getItem('dailyDate'));
}

TabStats.firstRun = function() {
    localStorage.setItem('firstRun', 'true');
    localStorage.setItem('firstRunDate', new Date());
    localStorage.setItem("totalCreated", 0);
    localStorage.setItem("totalDeleted", 0);
    localStorage.setItem('dailyCount', 0);
    localStorage.setItem('dailyDate', new Date());
    localStorage.setItem("showStat", 'true');
	localStorage.setItem('longestTimeOnTab', 0);
	localStorage.setItem('longestTimeOnTabTitle', "");
	localStorage.setItem('longestTimeOnTabUrl', "");
}

TabStats.loadStats = function() {
    if (localStorage.getItem("firstRun")) {
        TabStats.totalCreated = parseInt(localStorage.getItem("totalCreated"), 10);
        TabStats.totalDeleted = parseInt(localStorage.getItem("totalDeleted"), 10);
        TabStats.dailyCount = parseInt(localStorage.getItem("dailyCount"), 10);
		TabStats.longestTimeOnTab = parseInt(localStorage.getItem("longestTimeOnTab"), 10);
		TabStats.longestTimeOnTabTitle = localStorage.getItem("longestTimeOnTabTitle");
        TabStats.longestTimeOnTabUrl = localStorage.getItem("longestTimeOnTabUrl");
    }
}

TabStats.saveStats = function() {
    localStorage.setItem("totalCreated", TabStats.totalCreated);
    localStorage.setItem("totalDeleted", TabStats.totalDeleted);
    localStorage.setItem('dailyCount', TabStats.dailyCreatedCount);
    localStorage.setItem('dailyDate', TabStats.dailyDate);
	localStorage.setItem('longestTimeOnTab', TabStats.longestTimeOnTab);
	localStorage.setItem('longestTimeOnTabTitle', TabStats.longestTimeOnTabTitle);
    localStorage.setItem('longestTimeOnTabUrl', TabStats.longestTimeOnTabUrl);
}

TabStats.thousandCheck = function(val) {
    return (val > 1000 ? (val /1000).toFixed(1) + 'k' : val);
}

TabStats.renderValue = function() {
	TabStats.showValue = parseInt(localStorage.getItem("showValue"), 10);

    shouldShow = localStorage.getItem("showStat");

    if (shouldShow == "true") {
		switch(TabStats.showValue) {

			// Current Count
			case 1: 
	   			chrome.browserAction.setBadgeText({text: TabStats.thousandCheck(TabStats.currentCount) + ''});
	   			chrome.browserAction.setBadgeBackgroundColor({color: "#5885E4"});
	   			chrome.browserAction.setTitle({title: 'TabStats - ' + TabStats.currentCount + ' tabs currently open'});
			break;

			// Total Created
			case 2:
	   			chrome.browserAction.setBadgeText({text: TabStats.thousandCheck(TabStats.totalCreated) + ''});
	   			chrome.browserAction.setBadgeBackgroundColor({color: "#4E9C4E"});
	   			chrome.browserAction.setTitle({title: 'TabStats - ' + TabStats.totalCreated + ' tabs created total'});
			break;
			
			// Total Deleted
			case 3:
			    chrome.browserAction.setBadgeText({text: TabStats.thousandCheck(TabStats.totalDeleted) + ''});
	   			chrome.browserAction.setBadgeBackgroundColor({color: "#CF1E1E"});
	   			chrome.browserAction.setTitle({title: 'TabStats - ' + TabStats.totalDeleted + ' tabs deleted total'});
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
        TabStats.currentCount += windows[i].tabs.length;
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
    TabStats.duplicateCount = dupes;
    TabStats.saveStats();
}
