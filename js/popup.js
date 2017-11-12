var TabStats = null;

// Call init on load
window.addEventListener("load", init, false);

function init() {

	TabStats = chrome.extension.getBackgroundPage().window.TabStats;

	// Run the duplicate count check with the callback to display stat
	TabStats.duplicateCheck(updateDupCount);

	setupEventListeners();

    renderPopupStats();

	updateShowStatsCheckbox();
}

function setupEventListeners() {
	document.getElementById("showStat").addEventListener("click", toggleShowStats, false);
	document.getElementById("showCurrent").addEventListener("click", showCurrent, false);
	document.getElementById("showCreated").addEventListener("click", showCreated, false);
	document.getElementById("showDeleted").addEventListener("click", showDeleted, false);
	document.getElementById("exportStats").addEventListener("click", exportStats, false);
	document.getElementById("deletedReset").addEventListener("click", deletedReset, false);
	document.getElementById("longestReset").addEventListener("click", longestReset, false);
	document.getElementById("clearAllStats").addEventListener("click", clearAllStats, false);
}

function updateDupCount() {
    var elem = document.getElementById('duplicateCount');
	if (elem !== null) {
		elem.innerHTML = TabStats.Storage.stats.current.duplicate;
		if (TabStats.Storage.stats.current.duplicate) {
			elem.classList.add("stat-list__value--highlight");
		} else {
            elem.classList.remove("stat-list__value--highlight");
		}
	}

    var elemTotal = document.getElementById('duplicateTotalCount');
    if (elemTotal !== null) {
		elemTotal.innerHTML = TabStats.Storage.stats.totals.duplicate;
	}
}

function clearAllStats() {
    TabStats.resetStats();
    TabStats.updateRender();
}

function deletedReset() {
	TabStats.clearTotalDeleted();
}

function longestReset() {
    TabStats.clearLongestTab();
}

function renderPopupStats() {
	document.getElementById('currentCount').innerHTML = TabStats.Storage.stats.current.count;
	document.getElementById('totalCreated').innerHTML = TabStats.Storage.stats.totals.created;
	document.getElementById('totalDeleted').innerHTML = TabStats.Storage.stats.totals.deleted;
	document.getElementById('longestTimeOnTab').innerHTML = timeSince(TabStats.Storage.stats.longest.time / 1000);
	document.getElementById('longestTabName').setAttribute("title", TabStats.Storage.stats.longest.title);
    document.getElementById('duplicateTotalCount').innerHTML = TabStats.Storage.stats.totals.duplicate;

    setRadioValue("showStatType", TabStats.Storage.settings.showValue);

    // Get current window tab count
    chrome.tabs.getAllInWindow(null, function(tabs) {
    	document.getElementById('tabsForWindow').innerHTML = tabs.length;
    });
}

function setRadioValue(radioName, val) {
    var radios = document.getElementsByName(radioName);
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].value == val) {
            radios[i].checked = true;
            break;
        }
    }
}

function toggleShowStats() {
    TabStats.Storage.settings.showStats = document.getElementById("showStat").checked;
	TabStats.updateRender();
}

function exportStats() {
	var obj = JSON.stringify(TabStats.Storage.Stats);

	var expStr = document.createElement("input");
	expStr.setAttribute("value", obj);
	expStr.setAttribute("id", "exportValue");

	document.getElementById("stat-controls").appendChild(expStr);
	document.getElementById("exportValue").select();
}

function updateShowStatsCheckbox() {
	if (TabStats.Storage.settings.showStats) {
		document.getElementById("showStat").checked = true;
		document.getElementById("showStat").checked = "checked";
	} else {
		document.getElementById("showStat").checked = false;
	}
}

function showCurrent() {
    TabStats.Storage.settings.showValue = "CURRENT";
	TabStats.updateRender();
}

function showCreated() {
    TabStats.Storage.settings.showValue = "CREATED";
	TabStats.updateRender();
}

function showDeleted() {
    TabStats.Storage.settings.showValue = "DELETED";
	TabStats.updateRender();
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
