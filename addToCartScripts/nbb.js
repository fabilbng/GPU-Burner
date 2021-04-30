const findButton = () => {
    const addToCardButton = $(".shopping_cart_btn")
    if (addToCardButton.length !== 0){
        const productId = $("input[name='products_id']").attr('value')
        const catetogryId = $("input[name='categories_id']").attr('value')
        chrome.runtime.sendMessage({message: 'addToCardNbb', productId: productId, categoryId: catetogryId, url: window.location.href})
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        findButton()
    });
} else {  // `DOMContentLoaded` has already fired
    findButton();
}