const sendNotif = (tabId, text) => {
        chrome.tabs.sendMessage(tabId, {message: 'notif', text: text });
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getOptions = async () => {
    return await optionsStorage.getAll()
}

const validateOptions = (options) => {
    let isValid = true
   Object.keys(options).map((key) => {
        if(options[key] === '') isValid = false
   })
    return isValid
}
