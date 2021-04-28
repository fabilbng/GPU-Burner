chrome.runtime.onMessage.addListener(
    (request) => {
        if(request.message === 'enableUpdate'){
            console.log(request.value)
        }
    }
)