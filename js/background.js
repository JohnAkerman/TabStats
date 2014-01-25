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
    localStorage.setItem('dailyCount', 0);
    localStorage.setItem('dailyDate', 0);
    localStorage.setItem('currentCount', 0);
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
	TabStats.dailyCreatedCount = parseInt(localStorage.getItem("dailyCount"), 10);
    TabStats.dailyDate = new Date(localStorage.getItem('dailyDate'));
}

TabStats.firstRun = function() {
    localStorage.setItem('firstRun', 'true');
    localStorage.setItem("totalCreated", 0);
    localStorage.setItem('dailyCount', 0);
    localStorage.setItem('dailyDate', new Date());
}

TabStats.loadStats = function() {
    if (localStorage.getItem("firstRun")) {
        TabStats.currentCount = parseInt(localStorage.getItem("currentCount"), 10);
        TabStats.totalCreated = parseInt(localStorage.getItem("totalCreated"), 10);
        TabStats.dailyCount = parseInt(localStorage.getItem("dailyCount"), 10);
    }
}

TabStats.saveStats = function() {
    localStorage.setItem("totalCreated", TabStats.totalCreated);
    localStorage.setItem('dailyCount', TabStats.dailyCreatedCount);
    localStorage.setItem('dailyDate', TabStats.dailyDate);
    localStorage.setItem('currentCount', TabStats.currentCount);
}

TabStats.renderValue = function() {
	TabStats.showValue = parseInt(localStorage.getItem("showValue"), 10);

	switch(TabStats.showValue) {

		case 1:
   			chrome.browserAction.setBadgeText({text: TabStats.currentCount + ''});
		break;

		case 2:
   			chrome.browserAction.setBadgeText({text: TabStats.totalCreated + ''});
		break;
		
		case 3:
		    chrome.browserAction.setBadgeText({text: TabStats.totalDeleted + ''});
		break;
	}
}

TabStats.getCurrentCount = function() {
	var tmp = 0;
	
}

// Call init on load
window.addEventListener("load", TabStats.init, false);

chrome.windows.getAll({populate: true}, function (windows) {
	for(var i = 0; i < windows.length; i++) {
		TabStats.currentCount += windows[i].tabs.length;
   		TabStats.renderValue();
	}
});

