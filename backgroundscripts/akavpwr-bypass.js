const removeCookie =(cookie) => {
    var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain +
        cookie.path;
    console.log(url)
    chrome.cookies.remove({url: url, name: cookie.name}, (result) => {
        console.log(result)
    });
}

const setCookie = (cookie) => {
    let newCookie = cookie
    var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain
    delete newCookie['hostOnly']
    delete newCookie['session']
    newCookie.name[5] = 'a'
    newCookie.name[6] ='u'
    chrome.cookies.set({...newCookie, url: url}, (result) => console.log(result))
}

const setAkavCookie = (site) => {
    chrome.cookies.getAll({session: true, domain: site.url}, (cookies) => {
        const akavCookie = cookies.find(cookie => cookie.name.includes('akavpwr'))
        if(akavCookie){
            setCookie(akavCookie)
            return chrome.tabs.sendMessage(sender.tab.id, {message: 'addedAkavPauCookie'})
        }
        else {
            return
        }
})}

const checkForBypassCookie = (site) => {
    chrome.cookies.getAll({session: true, domain: site.url}, (cookies) => {
        const akavCookie = cookies.find(cookie => cookie.name.includes('akavpwr'))
        if(akavCookie){
            return chrome.tabs.sendMessage(sender.tab.id, {message: 'createManualQueueBpButton', site: site})
        }
        else {
            return
        }
})}


chrome.runtime.onMessage.addListener(
    (request, sender) => {
        if(request.message === 'checkForBypassCookie'){
            getOptions().then(options => {
                if (options.queueBpManualEnabled){
                    checkForBypassCookie(request.site)
                }
                else if (options.queueBpAutomaticEnabled){
                    setAkavCookie(request.site)
                }
                else {
                    chrome.tabs.sendMessage(sender.tab.id, {message: 'QueueBypassDisabled'})
                }
            })
        }
        else if (request.message === 'startQueueBp'){
            setAkavCookie(request.site)
        }
    }
)

