const findNBBButton = () => {
    const soldOutDiv = document.getElementsByClassName("soldOut")
    if (soldOutDiv.length != 0){
        notificationDiv.innerHTML = `<h3 style="color: white"> Product Sold Out</h3>`
        return
    }
    const addToCardButton = $(".shopping_cart_btn")
    if (addToCardButton.length !== 0){
        const productId = $("input[name='products_id']").attr('value')
        const catetogryId = $("input[name='categories_id']").attr('value')
        chrome.runtime.sendMessage({message: 'checkoutPossibleNbb', productId: productId, categoryId: catetogryId, url: window.location.href})
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        findNBBButton()
    });
} else {  // `DOMContentLoaded` has already fired
    findNBBButton();
}