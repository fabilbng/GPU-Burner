const supportedDomains = ["www.notebooksbilliger.de/", "www.gamestop.de"]
const removeCookie = (cookie) => {
    var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain +
        cookie.path;
    chrome.cookies.remove({url: url, name: cookie.name, storeId: cookie.storeId}, (result) => {
        console.log('Removed')
        console.log(result)
    });
}

const setCookie = async (cookie, newName) => {
    console.log(cookie)
    let newCookie = {...cookie}
    var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain
    delete newCookie['hostOnly']
    delete newCookie['session']
    delete newCookie['domain']
    newCookie.name=newName
    chrome.cookies.set({...newCookie, url: url}, (result) => console.log(result))
}

const setAkavCookie = (tabId, originUrl, options) => {
    const domain = supportedDomains.find(domain => originUrl.includes(domain))
    if (domain){
        chrome.cookies.getAll({session: true, domain: domain}, (cookies) => {
            const akavCookie = cookies.find(cookie => cookie.name.includes('akavpwr'))
            if(akavCookie){
                removeCookie(akavCookie)
                setCookie(akavCookie, options.queueBpNewCookieName)
                return chrome.tabs.sendMessage(tabId, {message: 'addedAkavPauCookie'})
            }
            else {
                return
            }
        })
    }
    }

const checkForBypassCookie = (tabId, originUrl) => {
    const domain = supportedDomains.find(domain => originUrl.includes(domain))
    if (domain){
        chrome.cookies.getAll({session: true, domain: domain}, (cookies) => {
            const akavCookie = cookies.find(cookie => cookie.name.includes('akavpwr'))
            if(akavCookie){
                    return chrome.tabs.sendMessage(tabId, {message: 'createManualQueueBpButton'})
            }
            else {
                return
            }
        })
    }
    }


chrome.runtime.onMessage.addListener(
    (request, sender) => {
        getOptions().then(options => {
            if(request.message === 'checkForBypassCookie'){
                    if (options.queueBpManualEnabled){
                        checkForBypassCookie(sender.tab.id, sender.origin)
                    }
                    else if (options.queueBpAutomaticEnabled){
                        setAkavCookie(sender.tab.id, sender.origin, options)
                    }
                    else {
                        chrome.tabs.sendMessage(sender.tab.id, {message: 'QueueBypassDisabled'})
                    }
            }
            else if (request.message === 'startQueueBp'){
                setAkavCookie(sender.tab.id, sender.origin, options)
            }
        })
    }
)

