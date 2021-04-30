var notificationDiv = document.createElement('div')
notificationDiv.style.position = 'fixed'
notificationDiv.style.bottom = '10px'
notificationDiv.style.left = '10px'
notificationDiv.style.width = '250px'
notificationDiv.style.height = '50px'
notificationDiv.style.backgroundColor = 'black'
notificationDiv.style.opacity="100"
notificationDiv.style.zIndex="9999"
notificationDiv.style.paddingLeft="15px"
document.body.appendChild(notificationDiv)

chrome.runtime.onMessage.addListener(

    (request) => {
        if (request.message === 'notif'){
            notificationDiv.innerHTML = `<h3 style="color: white"> ${request.text}</h3>`
        }
    })