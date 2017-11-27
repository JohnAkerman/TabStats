var TabStats;


function saveOptions() {
    // Store settings, close options panel

	var fileBuffer = 'data:text/json;charset=utf-8,';
	TabStats.Storage.settings.lastExport = new Date();
    TabStats.Storage.settings.exportVersion = '2.0';

	var fileObj = JSON.stringify(TabStats.Storage);
	var exportBtn = document.getElementById('exportStats');

	fileBuffer += encodeURIComponent(fileObj);

	// Setup the export button attributes
	exportBtn.setAttribute('href', fileBuffer);
	exportBtn.setAttribute('download', 'tabstats.json');
    exportBtn.click();
}

function init() {
    TabStats = chrome.extension.getBackgroundPage().window.TabStats;

    setupEventListeners();

    // Render any updates to controls
    updateRender();
}

function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

function updateRender() {
    updateExportDate();

    // Per Domain
    if (typeof TabStats.Storage.settings.perDomain !== "undefined" && TabStats.Storage.settings.perDomain) {
        document.getElementById("perDomain").checked = true;
        document.getElementById("perDomain").checked = "checked";
    } else if (typeof TabStats.Storage.settings.perDomain !== "undefined" && TabStats.Storage.settings.perDomain === false) {
        document.getElementById("perDomain").checked = false;
    } else {
        document.getElementById("perDomain").checked = true;
        TabStats.Storage.settings.perDomain = true;
    }

    document.getElementById('storageSize').innerHTML = byteCount(JSON.stringify(TabStats.Storage));
}

function updateExportDate() {
    if (typeof TabStats.Storage.settings.lastExport !== "undefined") {
        var d = new Date(TabStats.Storage.settings.lastExport);
        document.getElementById('last-backup').innerHTML = d.toGMTString();
    } else {
        document.getElementById('last-backup').innerHTML = "Never";
    }
}

function setupEventListeners() {
    document.getElementById('backup').addEventListener('click', saveOptions);
    document.getElementById('restore').addEventListener('click', triggerFileInput);
    document.getElementById('restorePicker').addEventListener('change', handleFileInput);
    document.getElementById('saveOptions').addEventListener('click', saveChanges);
}

function saveChanges() {
    TabStats.Storage.settings.perDomain = document.getElementById("perDomain").checked;
    TabStats.saveStats(); // TODO: Update this to save?

    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
        status.textContent = '';
    }, 2000);
}

document.addEventListener('DOMContentLoaded', init);

function triggerFileInput() {
    var fileInput = document.getElementById('restorePicker');
    fileInput.value = '';
    fileInput.click();
}

function handleFileInput() {
    var file = this.files[0];

    // Check to see if there is no file selected
    if (typeof file === "undefined" || file.name === "") return;

    TabStats.importFile(file, function(result) {
        if (result) {
            console.log("Success");
        } else {
            console.log("Failure");
        }
    });
}
