const checkForCookie = () => {
    chrome.runtime.sendMessage({message: 'startBypass', cookies: document.cookie})
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        checkForCookie()
    });
} else {  // `DOMContentLoaded` has already fired
    checkForCookie()
}