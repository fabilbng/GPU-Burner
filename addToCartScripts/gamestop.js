const checkGamestopPage = () => {
    const addToCardButton = $("#btnAddToCart")
    if (addToCardButton.length !== 0){
        const productId = $("#checkboxTwo").attr('value')
        chrome.runtime.sendMessage({message: 'checkoutPossibleGamestop', productId: productId})
    }
    else if (window.location.href === 'https://www.gamestop.de/App/Index/') {
            chrome.runtime.sendMessage({message: 'checkoutFromCartSitePossible'})
    }
    else if (window.location.href === 'https://www.gamestop.de/App/Index/Checkout/3'){
        chrome.runtime.sendMessage({message: 'sendNotifWithCreditCardDetails'})
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        checkGamestopPage()
    });
} else {  // `DOMContentLoaded` has already fired
    checkGamestopPage()
}