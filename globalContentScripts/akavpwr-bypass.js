const supportedSites= [{site:'notebooksbilliger', url: 'www.notebooksbilliger.de' }, {site:'gamestop', url:'www.gamestop.de' }]
var notificationDivRight = document.createElement('div')

const createNotificationDivRight = (notificationDivRight) => {
    notificationDivRight.style.position = 'fixed'
    notificationDivRight.style.bottom = '10px'
    notificationDivRight.style.right = '10px'
    notificationDivRight.style.width = '200px'
    notificationDivRight.style.height = '65px'
    notificationDivRight.style.backgroundColor = 'black'
    notificationDivRight.style.opacity="100"
    notificationDivRight.style.zIndex="9999"
}



const createBypassButton = (notificationDivRight, site) => {
    notificationDivRight.innerHTML= '' +
        '<div style=" height: 100%; display: flex; flex-direction: column; align-items: center;">' +
        '<h3 style="margin-bottom:5px; color: white">Bypass Possible</h3>' +
        '<button class="bypassButton" style="width: 100px; height: 35px">Try Bypass</button>' +
        '</div>'
    const bypassButton = notificationDivRight.getElementsByClassName('bypassButton')
    bypassButton[0].addEventListener("click", () => {
        chrome.runtime.sendMessage({message: 'startQueueBp', site: site})
    }, false);
    document.body.appendChild(notificationDivRight)
}

const createSuccessNotificationDivRight = (notificationDivRight) => {
    notificationDivRight.innerHTML= '' +
        '<div style=" height: 100%; display: flex; flex-direction: column; align-items: center;">' +
        '<h3 style="margin-bottom:5px; color: white">Added akavpau-cookie, refresh the page</h3>' +
        '</div>'
    document.body.appendChild(notificationDivRight)
}

const checkForCookie = () => {
    supportedSites.some(
        (site) => {
            if (window.location.href.includes(site.site)){
                createNotificationDivRight(notificationDivRight)
                return chrome.runtime.sendMessage({message: 'checkForBypassCookie', site: site})
            }
        }
    )
}

chrome.runtime.onMessage.addListener(
    (request) => {
    if (request.message === 'addedAkavPauCookie'){
        createSuccessNotificationDivRight(notificationDivRight)
    }
    else if (request.message === 'createManualQueueBpButton'){
        createBypassButton(notificationDivRight, request.site)
    }
    else if (request.message === 'QueueBypassDisabled'){
        notificationDivRight.innerHTML = 'QueueBp Disabled'
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