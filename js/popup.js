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
	document.getElementById('longestTimeOnTab').innerHTML =timeSince(TabStats.longestTimeOnTab/1000);
    
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


// Co: http://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
function timeSince(seconds) {

    console.log("Value in: " + seconds);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1)
        return interval + " years";
    
    interval = Math.floor(seconds / 2592000);

    if (interval > 1) 
        return interval + " months";
    
    interval = Math.floor(seconds / 86400);

    if (interval > 1)
        return interval + " days";
    
    interval = Math.floor(seconds / 3600);

    if (interval > 1)
        return interval + " hrs";

    interval = Math.floor(seconds / 60);

    if (interval > 1)
        return interval + " mins";
    
    return Math.floor(seconds) + " secs";
}