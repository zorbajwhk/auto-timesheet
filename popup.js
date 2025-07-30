// This script runs in the extension's popup.
// It uses chrome.tabs.sendMessage to communicate with the content script.

// The target URL for the automation
const TARGET_URL = 'https://teamspirit-609.lightning.force.com/lightning/n/teamspirit__AtkWorkTimeTab';

/**
 * Sends a message to the content script to start the automation.
 */
function startAutomation() {
    const startButton = document.getElementById('startButton');
    startButton.disabled = true;
    startButton.textContent = 'Running...';

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Send a message to the content script in the active tab.
        chrome.tabs.sendMessage(tabs[0].id, { action: "startAutomation" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError.message);
                startButton.textContent = 'Error: Refresh page';
            } else if (response && response.status) {
                console.log("Received response from content script:", response.status);
                startButton.textContent = response.status;
                 // Re-enable the button if the process is complete or had a recoverable error
                if(response.status.includes("Complete") || response.status.includes("Error")) {
                    setTimeout(() => {
                        startButton.disabled = false;
                        startButton.textContent = 'Start Automation';
                    }, 3000);
                }
            }
        });
    });
}

/**
 * Initializes the popup, checking the current URL to show the correct UI.
 */
document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const wrongPageMessage = document.getElementById('wrongPageMessage');
        const appBody = document.getElementById('appBody');

        if (currentTab && currentTab.url.startsWith(TARGET_URL)) {
            appBody.classList.remove('hidden');
            wrongPageMessage.classList.add('hidden');
            
            const startButton = document.getElementById('startButton');
            startButton.addEventListener('click', startAutomation);
        } else {
            wrongPageMessage.classList.remove('hidden');
            appBody.classList.add('hidden');
        }
    });
});
