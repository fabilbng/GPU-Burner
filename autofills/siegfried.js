//fuerSiegriedCheckout

const anotherMethod = () => {
    const checkoutNonce = $("#woocommerce-process-checkout-nonce").attr('value')
    chrome.runtime.sendMessage({message: 'checkoutSiegfried', checkoutNonce: checkoutNonce})
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', anotherMethod);
} else {  // `DOMContentLoaded` has already fired
    anotherMethod();
}