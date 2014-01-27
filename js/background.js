TabStats = {};

TabStats.currentCount = 0;
TabStats.totalCreated = 0;
TabStats.totalDeleted = 0;
TabStats.showValue = 1;

TabStats.dailyCreatedCount = 0;
TabStats.dailyDeletedCount = 0;

//Note this is the active tab for the current window
TabStats.activeTabId = -1;
TabStats.windowIdOfActiveTab = -1;
TabStats.longestTimeOnTab = 0; //milliseconds

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
   console.log("closeTab");
   TabStats.currentCount--;
   TabStats.totalDeleted++;
   
   TabStats.dayChangeResetter();

   TabStats.dailyDeletedCount++;
   
   TabStats.renderValue();
   
   TabStats.saveStats();
}

TabStats.onActiveTabChange = function(activeInfo) {
console.log("activeTabChange");
console.log(activeInfo);

 
  if(activeInfo.windowId == TabStats.windowIdOfActiveTab) {
     if(TabStats.activeTabId != -1) {
	    if(activeInfo.tabId != TabStats.activeTabId) {
	       totalTimeOnActiveTab = Date.now() - TabStats.activeTabStartDateInMs; //milliseconds
		   console.log(totalTimeOnActiveTab);
		   if(totalTimeOnActiveTab > TabStats.longestTimeOnTab) {
		      console.log("New Longest Time On Tab")
		      TabStats.longestTimeOnTab = totalTimeOnActiveTab;
			  TabStats.saveStats();
		   }
		}
	 }
	 else {
	    TabStats.activeTabStartDateInMs = Date.now(); //milliseconds
	 }
     TabStats.activeTabId = activeInfo.tabId;
  }
  else {
     TabStats.windowIdOfActiveTab = activeInfo.windowId;
	 TabStats.activeTabId = activeInfo.tabId;
	 TabStats.activeTabStartDateInMs = Date.now(); //milliseconds
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
}

TabStats.loadStats = function() {
    if (localStorage.getItem("firstRun")) {
        TabStats.totalCreated = parseInt(localStorage.getItem("totalCreated"), 10);
        TabStats.totalDeleted = parseInt(localStorage.getItem("totalDeleted"), 10);
        TabStats.dailyCount = parseInt(localStorage.getItem("dailyCount"), 10);
		TabStats.longestTimeOnTab = parseInt(localStorage.getItem("longestTimeOnTab"), 10);
    }
}

TabStats.saveStats = function() {
    localStorage.setItem("totalCreated", TabStats.totalCreated);
    localStorage.setItem("totalDeleted", TabStats.totalDeleted);
    localStorage.setItem('dailyCount', TabStats.dailyCreatedCount);
    localStorage.setItem('dailyDate', TabStats.dailyDate);
	localStorage.setItem('longestTimeOnTab', TabStats.longestTimeOnTab);
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
	   			chrome.browserAction.setTitle({title: 'TabStats - ' + TabStats.currentCount + ' tabs currently open'});
			break;

			// Total Created
			case 2:
	   			chrome.browserAction.setBadgeText({text: TabStats.totalCreated + ''});
	   			chrome.browserAction.setBadgeBackgroundColor({color: "#4E9C4E"});
	   			chrome.browserAction.setTitle({title: 'TabStats - ' + TabStats.totalCreated + ' tabs created total'});
			break;
			
			// Total Deleted
			case 3:
			    chrome.browserAction.setBadgeText({text: TabStats.totalDeleted + ''});
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

chrome.windows.getAll({populate: true}, function (windows) {
	for(var i = 0; i < windows.length; i++) {
		TabStats.currentCount += windows[i].tabs.length;
   		TabStats.renderValue();
	}
});

