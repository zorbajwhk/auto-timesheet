// This script runs in the extension's popup.
// It uses chrome.tabs.sendMessage to communicate with the content script.

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

        let isForcePage = false;
        if (currentTab && currentTab.url) {
            try {
                const url = new URL(currentTab.url);
                // This is more flexible than a hardcoded URL and matches host_permissions.
                if (url.protocol === 'https:' && url.hostname.endsWith('.force.com')) {
                    isForcePage = true;
                }
            } catch (e) {
                // Invalid URL (e.g., chrome://), so it's not a force.com page.
                isForcePage = false;
            }
        }

        if (isForcePage) {
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
