/*
 * This is a simplified version of the automation script.
 *
 * It is injected into all frames and waits for a message from the popup.
 * When a message is received, it checks if it is in the correct frame
 * by looking for the timesheet table, then runs the automation.
 *
 * UPDATE: Re-added logic to select the work location from the dropdown.
 */

// --- Configuration ---
const START_TIME = '11:00';
const END_TIME = '20:00';
const WORK_LOCATION_VALUE = 'a2510000009pMSHAA2'; // Value for 'リモート'

// --- State ---
let isProcessing = false;

/**
 * A helper function to pause execution for a specified time.
 * @param {number} ms - The number of milliseconds to wait.
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * The main automation logic.
 * @param {Document} doc - The document object to run the automation in.
 * @param {function} sendResponse - The function to send a response back to the popup.
 */
async function runAutomationLogic(doc, sendResponse) {
    console.log("DEBUG: runAutomationLogic() called.");
    if (isProcessing) {
        console.log("DEBUG: Automation is already in progress. Exiting.");
        sendResponse({ status: "Already running" });
        return;
    }
    isProcessing = true;
    console.log("--- Starting TeamSpirit Automation ---");

    // Select all weekday rows ('days even' and 'days odd' are covered by this)
    const dayRows = doc.querySelectorAll('tr.days:not(.rowcl1):not(.rowcl2):not(.rowcl3)');
    if (dayRows.length === 0) {
        alert("Automation Error: No weekday rows found to process.");
        console.error("DEBUG: Found 0 day rows. Stopping automation.");
        isProcessing = false;
        sendResponse({ status: "Error: No rows found" });
        return;
    }

    console.log(`DEBUG: Found ${dayRows.length} weekdays to process.`);
    let processedCount = 0;

    for (const row of dayRows) {
        console.log(`DEBUG: --- Processing row: ${row.id} ---`);
        const startTimeCell = row.querySelector('td.vst');
        
        // Skip rows that are already filled out
        if (!startTimeCell || startTimeCell.textContent.trim() !== '') {
            console.log(`DEBUG: Skipping row ${row.id} because it's already filled or invalid.`);
            continue;
        }

        processedCount++;
        
        console.log(`DEBUG: Clicking start time cell for row ${row.id}.`);
        startTimeCell.click();
        await sleep(2000);

        console.log("DEBUG: Searching for popup form elements...");
        const startTimeInput = doc.getElementById('startTime');
        const endTimeInput = doc.getElementById('endTime');
        const workLocationSelect = doc.getElementById('workLocationId'); // Find the dropdown
        const submitButton = doc.getElementById('dlgInpTimeOk');

        if (!startTimeInput || !endTimeInput || !workLocationSelect || !submitButton) {
            console.error(`DEBUG: Could not find one or more form elements in the popup for row ${row.id}. Skipping.`);
            const cancelButton = doc.getElementById('dlgInpTimeCancel');
            if (cancelButton) {
                cancelButton.click();
            }
            await sleep(2000);
            continue;
        }
        console.log("DEBUG: Successfully found required popup form elements.");

        console.log("DEBUG: Filling form values...");
        startTimeInput.value = START_TIME;
        endTimeInput.value = END_TIME;
        workLocationSelect.value = WORK_LOCATION_VALUE; // Set the dropdown value
        
        // Dispatch events to ensure the page framework recognizes the changes
        startTimeInput.dispatchEvent(new Event('input', { bubbles: true }));
        endTimeInput.dispatchEvent(new Event('input', { bubbles: true }));
        workLocationSelect.dispatchEvent(new Event('change', { bubbles: true })); // Dispatch change event for the dropdown
        await sleep(1000);

        console.log("DEBUG: Clicking submit button.");
        submitButton.click();
        console.log(`DEBUG: Submitted for row: ${row.id}`);
        await sleep(1000); // Wait a moment for the confirmation alert to appear

        // --- Handle the confirmation "OK" button ---
        const confirmOkButton = doc.getElementById('confirmAlertOk');
        if (confirmOkButton) {
            console.log("DEBUG: Found confirmation OK button. Clicking it.");
            confirmOkButton.click();
        } else {
            console.log("DEBUG: Confirmation OK button not found. Proceeding anyway.");
        }

        // --- Wait 5 seconds before the next loop ---
        console.log("DEBUG: Waiting 5 seconds before next row...");
        await sleep(8000);
    }

    const successMsg = `Automation Complete! Processed ${processedCount} days.`;
    console.log(successMsg);
    alert(successMsg);
    isProcessing = false;
    sendResponse({ status: "Complete!" });
}


/**
 * Listen for messages from the popup script.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startAutomation") {
        // Check if this instance of the script is in the correct frame by looking for the table.
        if (document.getElementById('mainTableBody')) {
            console.log("DEBUG: Message received and table found. Starting automation.");
            runAutomationLogic(document, sendResponse);
        } else {
            // Do nothing if the table isn't here. Another instance of the script (in the iframe) will handle it.
        }
        
        return true; // Indicates an async response.
    }
});

console.log("TeamSpirit Automator: Content script instance loaded.");
