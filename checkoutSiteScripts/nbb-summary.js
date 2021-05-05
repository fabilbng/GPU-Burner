const completeNbbCheckout = () => {
    const pToken = $("#_ptoken").attr('value')
    chrome.runtime.sendMessage({message: 'encryptCheckoutNbb', pToken: pToken})
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        completeNbbCheckout()
    });
} else {  // `DOMContentLoaded` has already fired
    completeNbbCheckout()
}

chrome.runtime.onMessage.addListener(
    (request) => {
        if(request.message === 'completeCheckoutNbb'){
            chrome.runtime.sendMessage({message: 'completeCheckoutNbb', pToken: request.pToken, pseudoCardPan: request.pseudoCardPan})
        }
    }
)