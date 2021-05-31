var notificationDivRight = document.createElement('div')
notificationDivRight.style.position = 'fixed'
notificationDivRight.style.bottom = '10px'
notificationDivRight.style.right = '10px'
notificationDivRight.style.width = '200px'
notificationDivRight.style.height = '65px'
notificationDivRight.style.backgroundColor = 'black'
notificationDivRight.style.opacity="100"
notificationDivRight.style.zIndex="9999"


const createBypassButton = (notificationDivRight, domain) => {
    notificationDivRight.innerHTML= '' +
        '<div style=" height: 100%; display: flex; flex-direction: column; align-items: center;">' +
        '<h3 style="margin-bottom:5px; color: white">Bypass Possible</h3>' +
        '<button class="bypassButton" style="width: 100px; height: 35px">Try Bypass</button>' +
        '</div>'
    const bypassButton = notificationDivRight.getElementsByClassName('bypassButton')
    bypassButton[0].addEventListener("click", () => {
        chrome.runtime.sendMessage({message: 'startQueueBp'})
    }, false);
    document.body.appendChild(notificationDivRight)
}

const createSuccessNotificationDivRight = (notificationDivRight) => {
    notificationDivRight.innerHTML= '' +
        '<div style="height: 100%; display: flex; flex-direction: column; align-items: center;">' +
        '<h3 style="margin-bottom:5px; color: white">Added akavpau-cookie, refresh the page</h3>' +
        '</div>'
    document.body.appendChild(notificationDivRight)
}

const checkForCookie = () => {
        return chrome.runtime.sendMessage({message: 'checkForBypassCookie', site: window.location.href})
}

chrome.runtime.onMessage.addListener(
    (request) => {
    if (request.message === 'addedAkavPauCookie'){
        createSuccessNotificationDivRight(notificationDivRight)
    }
    else if (request.message === 'createManualQueueBpButton'){
        createBypassButton(notificationDivRight, request.domain)
    }
    else if (request.message === 'QueueBypassDisabled'){
        notificationDivRight.innerHTML = '<h3 style="color: white"> Queue bp disabled</h3>'
        document.body.appendChild(notificationDivRight)
    }
})

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        checkForCookie()
    });
} else {  // `DOMContentLoaded` has already fired
    checkForCookie()
}