const getDomain = (url) => {
    if (url.includes('gamestop')){
        return 'www.gamestop.de'
    }
    else if (url.includes('notebooksbilliger')){
        return 'www.notebooksbilliger.de'
    }
    else {
        return false
    }
}

const changeCookie = (cookie, bypassButton) =>{
    const url = window.location.href
    const domain = getDomain(url)
    if (domain){
        document.cookie = `${cookie}; domain=${domain}; expires=Thu, 01 Jan 2000 00:00:00 UTC; path=/;`
        let newAkavpauCookie = cookie
        newAkavpauCookie[5] = 'w'
        newAkavpauCookie[6] = 'r'
        document.cookie = `${newAkavpauCookie}; domain=${domain}; expires=Session; path=/;`
        bypassButton.innerHTML='Bypassed!'
    }
    else {
        bypassButton.innerHTML='Site not supported'
    }

}

const createBypassButton = (cookie) => {
    var notificationDivRight = document.createElement('div')
    notificationDivRight.style.position = 'fixed'
    notificationDivRight.style.bottom = '10px'
    notificationDivRight.style.right = '10px'
    notificationDivRight.style.width = '200px'
    notificationDivRight.style.height = '65px'
    notificationDivRight.style.backgroundColor = 'black'
    notificationDivRight.style.opacity="100"
    notificationDivRight.style.zIndex="9999"
    notificationDivRight.innerHTML= '' +
        '<div style=" height: 100%; display: flex; flex-direction: column; align-items: center;">' +
        '<h3 style="margin-bottom:5px; color: white">Bypass Possible</h3>' +
        '<button class="bypassButton" style="width: 100px; height: 35px">Try Bypass</button>' +
        '</div>'
    const bypassButton = notificationDivRight.getElementsByClassName('bypassButton')
    bypassButton[0].addEventListener("click", () => {
        changeCookie(cookie, bypassButton[0])
    }, false);
    document.body.appendChild(notificationDivRight)
}

const checkForCookie = () => {
    const cookies = document.cookie
    const cookieArray = cookies.split(';')
    console.log(cookieArray)
    cookieArray.some(cookie => {
        if (cookie.includes('akavpau')){
            return createBypassButton(cookie)
        }
    })


}

/*if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        checkForCookie()
    });
} else {  // `DOMContentLoaded` has already fired
    checkForCookie()
}*/