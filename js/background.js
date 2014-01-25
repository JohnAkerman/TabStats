TabStats = {};

TabStats.currentCount = 0;
TabStats.totalCreated = 0;
TabStats.totalDeleted = 0;
TabStats.showValue = 1;

TabStats.dailyCreatedCount = 0;
TabStats.dailyDeletedCount = 0;

TabStats.init = function() {

	TabStats.checkFirstRun();

	chrome.tabs.onCreated.addListener(TabStats.onNewTab);
	chrome.tabs.onRemoved.addListener(TabStats.onCloseTab);
    localStorage.setItem('showValue', TabStats.showValue);
    TabStats.renderValue();
}


TabStats.dayChangeResetter = function() {

    var now = new Date();

    // Reset Daily counter on a new day
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
}

TabStats.onNewTab = function() {
    console.log("newTab");
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


TabStats.checkFirstRun = function() {
	if (!window.localStorage.getItem("firstRun")) {
		TabStats.firstRun();
	}
	TabStats.totalCreated = parseInt(localStorage.getItem("totalCreated"), 10);
	TabStats.totalDeleted = parseInt(localStorage.getItem("totalDeleted"), 10);
	TabStats.dailyCreatedCount = parseInt(localStorage.getItem("dailyCount"), 10);
    TabStats.dailyDate = new Date(localStorage.getItem('dailyDate'));
}

TabStats.firstRun = function() {
    localStorage.setItem('firstRun', 'true');
    localStorage.setItem("totalCreated", 0);
    localStorage.setItem("totalDeleted", 0);
    localStorage.setItem('dailyCount', 0);
    localStorage.setItem('dailyDate', new Date());
    localStorage.setItem("showStat", 'true');
}

TabStats.loadStats = function() {
    if (localStorage.getItem("firstRun")) {
        TabStats.totalCreated = parseInt(localStorage.getItem("totalCreated"), 10);
        TabStats.totalDeleted = parseInt(localStorage.getItem("totalDeleted"), 10);
        TabStats.dailyCount = parseInt(localStorage.getItem("dailyCount"), 10);
    }
}

TabStats.saveStats = function() {
    localStorage.setItem("totalCreated", TabStats.totalCreated);
    localStorage.setItem("totalDeleted", TabStats.totalDeleted);
    localStorage.setItem('dailyCount', TabStats.dailyCreatedCount);
    localStorage.setItem('dailyDate', TabStats.dailyDate);
}

TabStats.renderValue = function() {
	TabStats.showValue = parseInt(localStorage.getItem("showValue"), 10);

    shouldShow = localStorage.getItem("showStat");

    if (shouldShow == "true") {
		switch(TabStats.showValue) {

			// Current Count
			case 1: 
	   			chrome.browserAction.setBadgeText({text: TabStats.currentCount + ''});
	   			chrome.browserAction.setBadgeBackgroundColor({color: "#5885E4"});
			break;

			// Total Created
			case 2:
	   			chrome.browserAction.setBadgeText({text: TabStats.totalCreated + ''});
	   			chrome.browserAction.setBadgeBackgroundColor({color: "#4E9C4E"});
			break;
			
			// Total Deleted
			case 3:
			    chrome.browserAction.setBadgeText({text: TabStats.totalDeleted + ''});
	   			chrome.browserAction.setBadgeBackgroundColor({color: "#CF1E1E"});
			break;
		}
	} else {
	    chrome.browserAction.setBadgeText({text: ''}); // Show empty string
	}
}

// Call init on load
window.addEventListener("load", TabStats.init, false);

chrome.windows.getAll({populate: true}, function (windows) {
	for(var i = 0; i < windows.length; i++) {
		TabStats.currentCount += windows[i].tabs.length;
   		TabStats.renderValue();
	}
});

