TabStats = {};

TabStats.currentCount = 0;
TabStats.totalCreated = 0;
TabStats.totalDeleted = 0;

TabStats.dailyCreatedCount = 0;
TabStats.dailyDeletedCount = 0;
TabStats.showValue = 0;


// Call init on load
window.addEventListener("load", init, false);

// Per view load
function init() {
    document.getElementById("showStat").addEventListener("click", toggleShowStats, false);

    document.getElementById("showCurrent").addEventListener("click", showCurrent, false);
    document.getElementById("showCreated").addEventListener("click", showCreated, false);

    TabStats.loadStats();
    TabStats.showValue = parseInt(localStorage.getItem("showValue"), 10);

}

TabStats.loadStats = function() {
    if (localStorage.getItem("firstRun")) {
        TabStats.currentCount = parseInt(localStorage.getItem("currentCount"), 10);
        TabStats.totalCreated = parseInt(localStorage.getItem("totalCreated"), 10);
        TabStats.dailyCount = parseInt(localStorage.getItem("dailyCount"), 10);

        document.getElementById('currentCount').innerHTML = TabStats.currentCount;
        document.getElementById('totalCreated').innerHTML = TabStats.totalCreated;
    }
}

function clearStats() {
    localStorage.setItem("totalCreated", 0);
    localStorage.setItem('dailyCount', 0);
    localStorage.setItem('dailyDate', 0);
    localStorage.setItem('currentCount', 0);
    TabStats.loadStats();
}

function showCurrent() {
    localStorage.setItem("showValue", 1);
    TabStats.renderValue();
}

function showCreated() {
    localStorage.setItem("showValue", 2);
    TabStats.renderValue();
}

function toggleShowStats() {
}

TabStats.renderValue = function() {

    switch(TabStats.showValue) {

        case 1:
            chrome.browserAction.setBadgeText({text: TabStats.currentCount + ''});
        break;

        case 2:
            chrome.browserAction.setBadgeText({text: TabStats.totalCreated + ''});
        break;
    }
}