//fuersiegried/shop

const findButton = () => {
    const addToCardButton = document.getElementsByClassName('single_add_to_cart_button button alt')
    if (addToCardButton.length >= 1){
        const values = addToCardButton[0].attributes['2']
        const pid = values.value
        const baseURL = values.baseURI
        const checkoutNonce = $("#woocommerce-process-checkout-nonce").attr('value')
        chrome.runtime.sendMessage({message: 'addToCardSiegfried', pid: pid, baseURL: baseURL, checkoutNonce: checkoutNonce})
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', findButton);
} else {  // `DOMContentLoaded` has already fired
    findButton();
}

chrome.runtime.onMessage.addListener(
    (request )=> {
        if (request.message === 'fail'){
            alert('Failed')
        }
        if (request.message === 'notification'){

        }
    }
)