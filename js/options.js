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

function updateRender() {

}

function setupEventListeners() {
    document.getElementById('backup').addEventListener('click', saveOptions);
    document.getElementById('restore').addEventListener('click', triggerFileInput);
    document.getElementById('restorePicker').addEventListener('change', handleFileInput);
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

    var result = TabStats.importFile(file);

    if (result) {
        console.log("Success");
    } else {
        console.log("Failure");
    }
}
