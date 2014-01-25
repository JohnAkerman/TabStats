var TabStats = null;

var tabsForWindow = 0;


// Call init on load
window.addEventListener("load", init, false);

// Per view load
function init() {

    TabStats = chrome.extension.getBackgroundPage().window.TabStats;

    document.getElementById("showStat").addEventListener("click", toggleShowStats, false);

    document.getElementById("showCurrent").addEventListener("click", showCurrent, false);
    document.getElementById("showCreated").addEventListener("click", showCreated, false);
    document.getElementById("showDeleted").addEventListener("click", showDeleted, false);

    loadStats();
}

function loadStats() {
    TabStats.loadStats();
    document.getElementById('currentCount').innerHTML = TabStats.currentCount;
    document.getElementById('totalCreated').innerHTML = TabStats.totalCreated;
    document.getElementById('totalDeleted').innerHTML = TabStats.totalDeleted;

    
}
// Get current window tab count
chrome.tabs.getAllInWindow(null, function(tabs) {
    tabsForWindow = tabs.length;
    document.getElementById('tabsForWindow').innerHTML = tabsForWindow;
});

function toggleShowStats() {
}

function clearStats() {
    TabStats.clearStats();
}

function showCurrent() {
    localStorage.setItem("showValue", 1);
    TabStats.renderValue();
}

function showCreated() {
    localStorage.setItem("showValue", 2);
    TabStats.renderValue();
}

function showDeleted() {
    localStorage.setItem("showValue", 3);
    TabStats.renderValue();
}