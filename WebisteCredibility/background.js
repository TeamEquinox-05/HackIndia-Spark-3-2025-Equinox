let phishingURLs = [];

// Fetch phishing data from OpenPhish
async function fetchPhishingData() {
    try {
        const response = await fetch("https://openphish.com/feed.txt");
        const data = await response.text();
        phishingURLs = data.split("\n").map(url => url.trim());
        console.log("Phishing data updated:", phishingURLs.length, "entries");
    } catch (error) {
        console.error("Error fetching phishing data:", error);
    }
}

// Check if URL is in the phishing list
async function checkPhishing(url) {
    if (phishingURLs.length === 0) {
        await fetchPhishingData();
    }
    return phishingURLs.includes(url);
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "check_url") {
        checkPhishing(message.url).then(isPhishing => {
            sendResponse({ phishing: isPhishing });
        });
        return true; // Keep the message channel open for async response
    }
});

// Fetch data every 30 minutes
setInterval(fetchPhishingData, 30 * 60 * 1000);
fetchPhishingData();
