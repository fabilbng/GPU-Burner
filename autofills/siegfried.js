const fillStuff = () => {
    $("#billing_first_name").attr("value", "Fabian")
    $("#billing_last_name").attr("value", "Liebing")
    $("#billing_address_1").attr("value", "Georg-Schumann-Strasse 71")
    $("#billing_postcode").attr("value", "04155")
    $("#billing_city").attr("value", "Leipzig")
    $("#billing_email").attr("value", "liebfabi@googlemail.com")
    $("#billing_myfield12").attr("value", "28.05.1999")
    $("#pp-2b7b209fa2d21a583bb0cb28eafd2ffa").click()
    $("#terms").click()
    //$("#place_order").click()
}

const anotherMethod = () => {
    const checkoutNonce = $("#woocommerce-process-checkout-nonce").attr('value')
    console.log(checkoutNonce)
    chrome.runtime.sendMessage({message: 'checkout', checkoutNonce: checkoutNonce})
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', anotherMethod);
} else {  // `DOMContentLoaded` has already fired
    anotherMethod();
}