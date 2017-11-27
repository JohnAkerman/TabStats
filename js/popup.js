var TabStats = null;

// Call init on load
window.addEventListener("load", init, false);

function init() {

	TabStats = chrome.extension.getBackgroundPage().window.TabStats;

	// Run the duplicate count check with the callback to display stat
	// TabStats.duplicateCheck(updateDupCount);

	setupEventListeners();

    renderPopupStats();
    TabStats.checkDupes(false, function() {
        updateDupCount();
    });

	updateShowStatsCheckbox();
}

function setupEventListeners() {
	document.getElementById("showStat").addEventListener("click", toggleShowStats, false);
	document.getElementById("showCurrent").addEventListener("click", showCurrent, false);
	document.getElementById("showCreated").addEventListener("click", showCreated, false);
    document.getElementById("showDeleted").addEventListener("click", showDeleted, false);
	document.getElementById("showMuted").addEventListener("click", showMuted, false);
	document.getElementById("exportStats").addEventListener("click", exportStatFile, false);
	document.getElementById("importStats").addEventListener("click", displayImportStatsField, false);
	document.getElementById("deletedReset").addEventListener("click", deletedReset, false);
	document.getElementById("createdReset").addEventListener("click", createdReset, false);
	document.getElementById("longestReset").addEventListener("click", longestReset, false);
	document.getElementById("clearAllStats").addEventListener("click", clearAllStats, false);


	document.getElementById("dragarea").addEventListener("dragover", dragOver, true);
	document.getElementById("dragarea").addEventListener("dragend", dragEnd, true);
	document.getElementById("dragarea").addEventListener("dragleave", dragEnd, true);
	document.getElementById("dragarea").addEventListener("drop", dragDrop, true);
}

function updateDupCount() {
    var elem = document.getElementById('duplicateCount');
	if (elem !== null) {
		elem.innerHTML = TabStats.Storage.stats.current.duplicate;
		if (TabStats.Storage.stats.current.duplicate > 0) {
			elem.classList.add("stat-list__value--highlight");
		} else {
            elem.classList.remove("stat-list__value--highlight");
		}
	}

    var elemTotal = document.getElementById('duplicateTotalCount');
    if (elemTotal !== null) {
		elemTotal.innerHTML = TabStats.Storage.stats.totals.duplicated;
	}
}

function clearAllStats() {
    TabStats.resetStats();
    renderPopupStats();
}

function deletedReset() {
	TabStats.clearTotalDeleted();
	document.getElementById('totalDeleted').innerHTML = TabStats.Storage.stats.totals.deleted || 0;
	renderPopupStats();
}

function createdReset() {
	TabStats.clearTotalCreated();
	document.getElementById('totalCreated').innerHTML = TabStats.Storage.stats.totals.created || 0;
	renderPopupStats();
}

function longestReset() {
    TabStats.clearLongestTab();
	renderPopupStats();
}

function renderPopupStats() {
	document.getElementById('currentCount').innerHTML = TabStats.Storage.stats.current.count || 0;
    document.getElementById('totalCreated').innerHTML = TabStats.Storage.stats.totals.created || 0;
	document.getElementById('totalDeleted').innerHTML = TabStats.Storage.stats.totals.deleted || 0;
	document.getElementById('longestTimeOnTab').innerHTML = timeSince(TabStats.Storage.stats.longest.time / 1000) || 0;
	document.getElementById('longestTabName').setAttribute("title", TabStats.Storage.stats.longest.title);
    document.getElementById('duplicateTotalCount').innerHTML = TabStats.Storage.stats.totals.duplicate || 0;
    document.getElementById('mutedCount').innerHTML = TabStats.Storage.stats.current.muted || 0;
    document.getElementById('mutedTotalCount').innerHTML = TabStats.Storage.stats.totals.muted || 0;
    document.getElementById('pinnedCount').innerHTML = TabStats.Storage.stats.current.pinned || 0;
    document.getElementById('pinnedTotalCount').innerHTML = TabStats.Storage.stats.totals.pinned || 0;

    if (TabStats.Storage.settings.allowedIncognito) {
        document.getElementById('incognitoCount').innerHTML = TabStats.Storage.stats.current.incognito || 0;
        document.getElementById('incognitoTotalCount').innerHTML = TabStats.Storage.stats.totals.incognito || 0;
        document.getElementById('incognitoCount').parentElement.classList.remove("hide");
        document.getElementById('incognitoTotalCount').parentElement.classList.remove("hide");
    } else {
        document.getElementById('incognitoCount').parentElement.classList.add("hide");
        document.getElementById('incognitoTotalCount').parentElement.classList.add("hide");
    }

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

function exportStatFile() {
	var fileBuffer = 'data:text/json;charset=utf-8,';
	TabStats.Storage.settings.lastExport = new Date();

	var fileObj = JSON.stringify(TabStats.Storage);
	var exportBtn = document.getElementById('exportStats');

	fileBuffer += encodeURIComponent(fileObj);

	// Setup the export button attributes
	exportBtn.setAttribute('href', fileBuffer);
	exportBtn.setAttribute('download', 'tabstats.json');
}

function displayImportStatsField() {
	exportfield = document.getElementById("exportValue");
	if (exportfield != null) {
	   exportfield.remove();
	}
  if (document.getElementById('importValue') == null) {
		var input = document.createElement("input");
		input.setAttribute("id", "importValue");
		document.getElementById("stat-controls").appendChild(input);
		document.getElementById("importValue").select();
		var apply  = document.createElement("a");
		apply.setAttribute("id", "applyImport");
		apply.setAttribute("href", "#");
		apply.innerHTML = "Apply";
		document.getElementById("stat-controls").appendChild(apply);
			document.getElementById("applyImport").addEventListener("click", importStats, false);
	}
}

function importStats() {
	if(document.getElementById("importValue") != null) {
		try {
			var obj = JSON.parse(document.getElementById("importValue").value);
			if(validateImportedStats(obj) == false) {
				throw 'Invaild Import Stats';
			}
			TabStats.Storage.stats = obj;
			TabStats.updateRender();
			document.getElementById('importValue').remove();
			document.getElementById('applyImport').remove();
		}
		catch (e) {
			//Todo report invalid JSON or Stats
			throw e;
		}
	}
}

function validateImportedStats(jsonObj) {
		 if(jsonObj.totals == null) {
			 return false;
		 }
		 if(jsonObj.longest == null || jsonObj.longest.time == null
			 || jsonObj.longest.title == null || jsonObj.longest.url == null) {
			 return false;
		 }
		 if(jsonObj.current == null || jsonObj.current.count == null
		 	 || jsonObj.current.date == null || jsonObj.current.active == null
			 || jsonObj.current.duplicate == null || jsonObj.current.muted == null
		   || jsonObj.current.pinned == null || jsonObj.current.incognito == null) {
			 return false;
		 }
		 cActive = jsonObj.current.active;
		 if(cActive.startTime == null || cActive.title == null
			 || cActive.url == null) {
				 return false;
			 }
			 return true;
}

function dragStart(e) {
 	e.dataTransfer.setData('text/plain', null); //cannot be empty string
}

function dragOver(e) {
	e.preventDefault();
	this.classList.add('drag-hover');
}

function dragEnd(e) {
	e.preventDefault();
	this.classList.remove('drag-hover');
}

function dragDrop(e) {
	e.preventDefault();
	this.classList.remove('drag-hover');
	var file = e.dataTransfer.files[0];

	TabStats.importFile(file, function(result) {
        if (result) {
			renderPopupStats();
        }
    });
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

function showMuted() {
    TabStats.Storage.settings.showValue = "MUTED";
	TabStats.updateRender();
}

// Co: http://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
function timeSince(seconds) {
	var interval = Math.floor(seconds / 31536000);
	if (interval > 1)
		return interval + " years";

	interval = Math.floor(seconds / 2592000);
	if (interval > 1)
		return interval + "months";

	interval = Math.floor(seconds / 86400);
	if (interval > 1)
		return interval + "d";

	interval = Math.floor(seconds / 3600);
	if (interval > 1)
		return interval + "h";

	interval = Math.floor(seconds / 60);
	if (interval > 1)
		return interval + "m";

	return Math.floor(seconds) + "s";
}
