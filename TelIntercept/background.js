chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type !== "dial") return;

    chrome.tabs.query({}, function (tabs) {
        for (const tab of tabs) {
            if (tab.url && tab.url.includes("dynamics.com")) {
                chrome.tabs.sendMessage(tab.id, {
                    type: "dial",
                    linkValue: msg.linkValue
                });
            }
        }
    });
});
