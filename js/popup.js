TabStats = {};

TabStats.currentCount = 0;
TabStats.totalCreated = 0;
TabStats.totalDeleted = 0;

TabStats.dailyCreatedCount = 0;
TabStats.dailyDeletedCount = 0;


// Call init on load
window.addEventListener("load", init, false);

// Per view load
function init() {
    document.getElementById("showStat").addEventListener("click", toggleShowStats, false);

    document.getElementById("showCurrent").addEventListener("click", showCurrent, false);
    document.getElementById("showCreated").addEventListener("click", showCreated, false);

    TabStats.loadStats();
}

TabStats.loadStats = function() {
    if (window.localStorage.getItem("firstRun")) {
        TabStats.currentCount = parseInt(localStorage.getItem("currentCount"), 10);
        TabStats.totalCreated = parseInt(localStorage.getItem("totalCreated"), 10);
        TabStats.dailyCount = parseInt(localStorage.getItem("dailyCount"), 10);

        document.getElementById('currentCount').innerHTML = TabStats.currentCount;
        document.getElementById('totalCreated').innerHTML = TabStats.totalCreated;
    }
}

function showCurrent() {
    localStorage.setItem("showValue", 1);
}

function showCreated() {
    localStorage.setItem("showValue", 2);
}

function toggleShowStats() {
    console.log(bg);
}