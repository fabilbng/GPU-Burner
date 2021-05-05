const startNbbCheckout = () => {
    const klarnaTokenId = $("#klarna_client_token").attr('value')
    const klarnaSessionId = $("[name=klarna_session_id]").attr('value')
    chrome.runtime.sendMessage({message: 'startCheckoutNbb', klarnaTokenId: klarnaTokenId, klarnaSessionId: klarnaSessionId})
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        startNbbCheckout()
    });
} else {  // `DOMContentLoaded` has already fired
    startNbbCheckout()
}