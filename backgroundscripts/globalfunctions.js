const sendNotif = (text) => {
    chrome.tabs.query({active: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {message: 'notif', text: text });
    });
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}