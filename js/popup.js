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

    document.getElementById("showStat").addEventListener("click", toggleShowStats, false);


    loadStats();

    // Check if show is ticked
    checkShowStats();
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
    if (document.getElementById("showStat").checked) {
        localStorage.setItem("showStat", "true");
    } else {
        localStorage.setItem("showStat", "false");
    }
    TabStats.renderValue();
}

function checkShowStats() {
    if (localStorage.getItem("showStat") == "true") {
        document.getElementById("showStat").checked = true;
        document.getElementById("showStat").checked = "checked"; 
    } else {
        document.getElementById("showStat").checked = false;
    }
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