TabStats = {};

TabStats.currentCount = 0;
TabStats.totalCreated = 0;

TabStats.init = function() {

	TabStats.checkFirstRun();

	chrome.tabs.onCreated.addListener(TabStats.onNewTab);
	TabStats.getCurrentCount();
}

TabStats.onNewTab = function() {

	TabStats.totalCreated++;
	var now = new Date();

	// Check if new tab is a new day
	if (now.getDate() != TabStats.dailyDate.getDate()) {
		TabStats.dailyCount = 1;
		TabStats.dailyDate = now;		
	} else
		TabStats.dailyCount++;

	chrome.browserAction.setBadgeText({text: TabStats.dailyCount + ''});
	
	TabStats.saveStats();
}

TabStats.checkFirstRun = function() {
	if (!window.localStorage.getItem("firstRun")) {
		TabStats.firstRun();
	}
	TabStats.totalCreated = parseInt(localStorage.getItem("totalCreated"), 10);
	TabStats.dailyCount = parseInt(localStorage.getItem("dailyCount"), 10);
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
    localStorage.setItem('dailyCount', TabStats.dailyCount);
    localStorage.setItem('dailyDate', TabStats.dailyDate);
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
