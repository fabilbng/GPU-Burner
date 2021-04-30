const addToCardSiegfried = async (baseURL, pid) => {
    try {
            sendNotif('Adding To Card...')
            const response = await fetch(baseURL, {
                "redirect": 'manual',
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "accept-language": "en-US,en;q=0.9,de;q=0.8",
                    "cache-control": "max-age=0",
                    "content-type": "multipart/form-data; boundary=----WebKitFormBoundary6NrtWMeVyYgD0FNS",
                    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "same-origin",
                    "sec-fetch-user": "?1",
                    "upgrade-insecure-requests": "1"
                },
                "referrer": baseURL,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": `------WebKitFormBoundary6NrtWMeVyYgD0FNS\r\nContent-Disposition: form-data; name=\"tm-epo-counter\"\r\n\r\n1\r\n------WebKitFormBoundary6NrtWMeVyYgD0FNS\r\nContent-Disposition: form-data; name=\"tcaddtocart\"\r\n\r\n${pid}\r\n------WebKitFormBoundary6NrtWMeVyYgD0FNS\r\nContent-Disposition: form-data; name=\"addon-${pid}-grussbotschaft-an-den-beschenkten-option-0\"\r\n\r\n\r\n------WebKitFormBoundary6NrtWMeVyYgD0FNS\r\nContent-Disposition: form-data; name=\"quantity\"\r\n\r\n1\r\n------WebKitFormBoundary6NrtWMeVyYgD0FNS\r\nContent-Disposition: form-data; name=\"add-to-cart\"\r\n\r\n${pid}\r\n------WebKitFormBoundary6NrtWMeVyYgD0FNS--\r\n`,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            })
            if (response.status === 0){
                sendNotif('Success! Going to checkout!')
                return true
            }
            else throw 'Error on Adding To Card'
        } catch (error) {
            console.log(error)
            sendNotif('Error! Retrying...')
            await timeout(1000)
            addToCardSiegfried(baseURL, pid)
        }

}

const checkoutSiegfried = async (checkoutNonce) => {
    try {
        sendNotif('Checking out...')
        const response = await fetch("https://www.siegfriedgin.com/?wc-ajax=checkout", {
            "headers": {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.9,de;q=0.8",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                "sec-ch-ua-mobile": "?0",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest"
            },
            "referrer": "https://www.siegfriedgin.com/shop/checkout/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "billing_country=DE&" +
                `billing_first_name=${formData.firstName}&` +
                `billing_last_name=${formData.lastName}&` +
                "billing_company=&" +
                `billing_address_1=${formData.street}&` +
                "billing_address_2=&" +
                `billing_postcode=${formData.postcode}&` +
                `billing_city=${formData.city}&` +
                `billing_email=${formData.email}&` +
                `billing_myfield12=${formData.birthdate}&` +
                "shipping_country=DE&" +
                "shipping_company=&" +
                `shipping_first_name=${formData.firstName}&` +
                `shipping_last_name=${formData.lastName}&` +
                `shipping_address_1=${formData.street}&` +
                "shipping_address_2=&" +
                `shipping_postcode=${formData.postcode}&` +
                `shipping_city=${formData.city}&` +
                "shipping_method%5B0%5D=wbs%3A42fd6951_dhl_go_green&" +
                "payment_method=paypal_plus&terms=on&" +
                "terms-field=1&" +
                `woocommerce-process-checkout-nonce=${checkoutNonce}&` +
                "_wp_http_referer=%2F%3Fwc-ajax%3Dupdate_order_review",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        })
        const result = await response.json()
        if (result.result === 'success') {
            sendNotif('Success! Redirecting...')
            chrome.tabs.query({active: true}, function (tabs) {
                    var activeTab = tabs[0];
                    chrome.tabs.update(activeTab.id, {url: result.redirect});
                })
            return true
        }
        else throw 'Error'
    }  catch (error) {
        console.log(error)
        sendNotif('Error! Retrying...')
        await timeout(1800)
        checkoutSiegfried(checkoutNonce)
    }
}


chrome.runtime.onMessage.addListener(
    (request) => {
        if (request.message === "addToCardSiegfried"){
           addToCardSiegfried(request.baseURL, request.pid)
               .then(() => {
                    chrome.tabs.query({active: true}, function(tabs) {
                        var activeTab = tabs[0];
                        chrome.tabs.update(activeTab.id, {url: 'https://www.siegfriedgin.com/shop/checkout/'});
                    });
            })
        }
        else if (request.message === 'checkoutSiegfried'){
           checkoutSiegfried(request.checkoutNonce)
        }
    }
)