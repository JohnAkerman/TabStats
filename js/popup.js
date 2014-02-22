var TabStats = null;

var tabsForWindow = 0;


// Call init on load
window.addEventListener("load", init, false);

// Per view load
function init() {
    
    TabStats = chrome.extension.getBackgroundPage().window.TabStats;

    // Run the duplicate count check with the callback to display stat
    TabStats.duplicateCheck(function() {
        document.getElementById('duplicateCount').innerHTML = TabStats.Stats.duplicateCount;
        if (TabStats.Stats.duplicateCount)
            document.getElementById('duplicateCount').setAttribute("class", "duplicateHighlight");
        else
            document.getElementById('duplicateCount').removeAttribute("class");
    });

    document.getElementById("showStat").addEventListener("click", toggleShowStats, false);

    document.getElementById("showCurrent").addEventListener("click", showCurrent, false);
    document.getElementById("showCreated").addEventListener("click", showCreated, false);
    document.getElementById("showDeleted").addEventListener("click", showDeleted, false);
    document.getElementById("exportStats").addEventListener("click", exportStats, false);

    // Reset stats
    document.getElementById("deletedReset").addEventListener("click", deletedReset, false);
    document.getElementById("longestReset").addEventListener("click", longestReset, false);

    document.getElementById("clearAllStats").addEventListener("click", clearAllStats, false);

    loadStats();

    // Check if show is ticked
    checkShowStats();
}

function clearAllStats() {
    TabStats.Stats = {
    "activeTab": {
        "id" : -1,
        "windowId" : -1,
        "url" : "",
        "title" : "",
        "StartDateInMs" :0
    },
    "longest" : {
        "tab": {
            "time" : 0,
            "url" : "",
            "title" : ""
        }
    },
    "daily" : {
        "created": 0,
        "deleted": 0
    },
    "total" : {
        "created": 0,
        "deleted": 0
    },
    "duplicateCount" : TabStats.Stats.duplicateCount,
    "currentCount" : TabStats.Stats.currentCount
    };

    loadStats();
}

function deletedReset() {
    TabStats.Stats.total.deleted = 0;
    document.getElementById('totalDeleted').innerHTML = 0;
    TabStats.saveStats();
}

function longestReset() {
    TabStats.Stats.longest.tab.time = 0;
    document.getElementById('longestTimeOnTab').innerHTML = 0;
    TabStats.saveStats();  
}

function loadStats() {
    TabStats.loadStats();
    document.getElementById('currentCount').innerHTML = TabStats.Stats.currentCount;
    document.getElementById('totalCreated').innerHTML = TabStats.Stats.total.created;
    document.getElementById('totalDeleted').innerHTML = TabStats.Stats.total.deleted;
    document.getElementById('longestTimeOnTab').innerHTML =timeSince(TabStats.Stats.longest.tab.time/1000);
    document.getElementById('longestTabName').setAttribute("title", TabStats.Stats.longest.tab.title);
}

// Get current window tab count
chrome.tabs.getAllInWindow(null, function(tabs) {
    tabsForWindow = tabs.length;
    document.getElementById('tabsForWindow').innerHTML = tabsForWindow;
});

function toggleShowStats() {
    if (document.getElementById("showStat").checked) {
        localStorage.setItem("Settings.showStat", "true");
    } else {
        localStorage.setItem("Settings.showStat", "false");
    }
    TabStats.renderValue();
}

function exportStats() {
    var exp = JSON.stringify(TabStats.Stats);

    var expStr = document.createElement("input");
    expStr.setAttribute("value", exp);
    expStr.setAttribute("id", "exportValue");

    document.getElementById("stat-controls").appendChild(expStr);

    document.getElementById("exportValue").select();
}

function checkShowStats() {
    if (localStorage.getItem("Settings.showStat") == "true") {
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
    localStorage.setItem("Settings.showValue", 1);
    TabStats.renderValue();
}

function showCreated() {
    localStorage.setItem("Settings.showValue", 2);
    TabStats.renderValue();
}

function showDeleted() {
    localStorage.setItem("Settings.showValue", 3);
    TabStats.renderValue();
}

// Co: http://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
function timeSince(seconds) {

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