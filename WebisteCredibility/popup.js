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
