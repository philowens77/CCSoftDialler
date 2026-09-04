function isDynamicsPage() {
    return location.href.includes("dynamics.com") 
	// Use this to limit use to a specific dynamics application
	// && (location.href.includes("appid=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx") 
    );
}

// Inject listener into Dynamics pages
if (isDynamicsPage()) {
    const s = document.createElement("script");
    s.src = chrome.runtime.getURL("dynamics-listener.js");
    document.documentElement.appendChild(s);
}

document.addEventListener("click", function (e) {
    const link = e.target.closest("a[href^='tel:']");
    if (!link) return;

    // Only intercept tel: links on Dynamics pages
    if (isDynamicsPage()) {
        e.preventDefault();
        
        const linkValueNumberOrName = link.getAttribute("href").replace("tel:", "").trim();
        chrome.runtime.sendMessage({ type: "dial", linkValue: linkValueNumberOrName });
    }
    else
    {
        console.log("Not a Dynamics page, letting tel: link proceed normally.");
    }
    // Let other pages handle tel: links normally (will open phone app)
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => { 
    if (msg.type !== "dial") return; 
    window.postMessage({ type: "dial", linkValue: msg.linkValue }, "*"); 
});

function isValidInternationalPhoneNumber(number) {
    // Check if number starts with + and contains only digits after the +
    const internationalPattern = /^\+\d+$/;
    return internationalPattern.test(number);
}