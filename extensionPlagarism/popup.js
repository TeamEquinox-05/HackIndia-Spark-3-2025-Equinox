document.getElementById("checkButton").addEventListener("click", checkAIText);

async function checkAIText() {
    chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
        const selectedText = await getSelectedText(tabs[0].id);
        
        if (!selectedText.trim()) {
            alert("Please select some text on the webpage.");
            return;
        }

        const apiKey = "AEZE8YT39S858SKT5QAD4ZY3ZEJ01QI0";
        const apiUrl = "https://api.sapling.ai/api/v1/aidetect";

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                key: apiKey,
                text: selectedText
            })
        });

        const data = await response.json();
        
        if (data && data.score !== undefined) {
            let aiPercentage = (data.score * 100).toFixed(2);
            let humanPercentage = (100 - aiPercentage).toFixed(2);

            document.getElementById("result").innerText = 
                `AI-generated: ${aiPercentage}% | Human-written: ${humanPercentage}%`;
        } else {
            document.getElementById("result").innerText = 
                "Error checking text. Please try again.";
        }
    });
}

function getSelectedText(tabId) {
    return new Promise((resolve, reject) => {
        chrome.scripting.executeScript(
            {
                target: { tabId: tabId },
                func: getSelectionText
            },
            (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result[0].result);
                }
            }
        );
    });
}

function getSelectionText() {
    return window.getSelection().toString();
}


//////////////////


document.addEventListener("DOMContentLoaded", async () => {
    const statusElement = document.getElementById("status");

    // Get the active tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const currentURL = new URL(tabs[0].url).origin;

            // Send the URL to background.js for checking
            chrome.runtime.sendMessage({ action: "check_url", url: currentURL }, (response) => {
                if (response.phishing) {
                    statusElement.innerHTML = "🚨 <span style='color:red;'>This website is a phishing site!</span>";
                } else {
                    statusElement.innerHTML = "✅ <span style='color:green;'>This website is safe.</span>";
                }
            });
        }
    });
});

