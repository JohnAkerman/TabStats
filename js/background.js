TabStats = {};

TabStats.currentCount = 0;
TabStats.totalCreated = 0;
TabStats.totalDeleted = 0;

TabStats.dailyCreatedCount = 0;
TabStats.dailyDeletedCount = 0;

TabStats.init = function() {

	TabStats.checkFirstRun();

	chrome.tabs.onCreated.addListener(TabStats.onNewTab);
	chrome.tabs.onRemoved.addListener(TabStats.onCloseTab);
	TabStats.currentCount = TabStats.getCurrentCount();
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

TabStats.onNewTab = function() {
    console.log("newTab");
	TabStats.totalCreated++;
	
	TabStats.dayChangeResetter();
	
	TabStats.dailyCreatedCount++;

    TabStats.renderValue();
	
	TabStats.saveStats();
}



TabStats.onCloseTab = function() {
   TabStats.currentCount = TabStats.getCurrentCount();
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

TabStats.saveStats = function() {
    localStorage.setItem("totalCreated", TabStats.totalCreated);
    localStorage.setItem('dailyCount', TabStats.dailyCreatedCount);
    localStorage.setItem('dailyDate', TabStats.dailyDate);
    localStorage.setItem('currentCount', TabStats.currentCount);
}

TabStats.renderValue = function() {
	TabStats.selectedShow = parseInt(localStorage.getItem("showValue"), 10);

	switch(TabStats.selectedShow) {

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
	chrome.windows.getAll(null, function (windows) {
		for (i in windows) {
			chrome.tabs.getAllInWindow(windows[i].id, function (t) {
				tmp += t.length;
			});
		}
	});
	return tmp;
}

// Call init on load
window.addEventListener("load", TabStats.init, false);
