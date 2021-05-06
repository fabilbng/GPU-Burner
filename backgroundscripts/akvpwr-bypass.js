chrome.runtime.onMessage.addListener(
    (request, sender) => {
        if (request.message === 'startBypass'){
            const cookieArray = request.cookies.split(';')
            //console.log(cookieArray)
        }
    }
)