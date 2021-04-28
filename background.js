chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.active === true) {
            chrome.tabs.sendMessage(tabId, {"message": "lookForButton"});
    }
})

chrome.runtime.onMessage.addListener(
    (request) => {
        if (request.message === "addToCard"){
            fetch(request.baseURL, {
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
                "referrer": request.baseURL,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": `------WebKitFormBoundary6NrtWMeVyYgD0FNS\r\nContent-Disposition: form-data; name=\"tm-epo-counter\"\r\n\r\n1\r\n------WebKitFormBoundary6NrtWMeVyYgD0FNS\r\nContent-Disposition: form-data; name=\"tcaddtocart\"\r\n\r\n${request.pid}\r\n------WebKitFormBoundary6NrtWMeVyYgD0FNS\r\nContent-Disposition: form-data; name=\"addon-${request.pid}-grussbotschaft-an-den-beschenkten-option-0\"\r\n\r\n\r\n------WebKitFormBoundary6NrtWMeVyYgD0FNS\r\nContent-Disposition: form-data; name=\"quantity\"\r\n\r\n1\r\n------WebKitFormBoundary6NrtWMeVyYgD0FNS\r\nContent-Disposition: form-data; name=\"add-to-cart\"\r\n\r\n${request.pid}\r\n------WebKitFormBoundary6NrtWMeVyYgD0FNS--\r\n`,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            }).then(result => {
                console.log(result)
                if(result.status === 200 || true) {
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        var activeTab = tabs[0];
                        chrome.tabs.update(activeTab.id, {url: 'https://www.siegfriedgin.com/shop/checkout/'});
                    });
                }
                else {
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        var activeTab = tabs[0];
                        chrome.tabs.sendMessage(activeTab.id, {"message": "fail"});
                    });
                }
            })
        }
        else if (request.message === 'checkout'){
            fetch("https://www.siegfriedgin.com/?wc-ajax=checkout", {
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
                    "billing_first_name=Fabian&" +
                    "billing_last_name=Liebing&" +
                    "billing_company=&" +
                    "billing_address_1=Georg-Schumann-Strasse+71&" +
                    "billing_address_2=&" +
                    "billing_postcode=04155&billing_city=Leipzig&" +
                    "billing_email=liebfabi%40googlemail.com&" +
                    "billing_myfield12=28.05.1999&" +
                    "shipping_country=DE&" +
                    "shipping_company=&" +
                    "shipping_first_name=Fabian&" +
                    "shipping_last_name=Liebing&" +
                    "shipping_address_1=Georg-Schumann-Strasse+71&" +
                    "shipping_address_2=&" +
                    "shipping_postcode=04155&" +
                    "shipping_city=Leipzig&" +
                    "shipping_method%5B0%5D=wbs%3A42fd6951_dhl_go_green&" +
                    "payment_method=paypal_plus&terms=on&" +
                    "terms-field=1&" +
                    `woocommerce-process-checkout-nonce=${request.checkoutNonce}&` +
                    "_wp_http_referer=%2F%3Fwc-ajax%3Dupdate_order_review",
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            }).then(result => {
                result.json().then(result => {
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        var activeTab = tabs[0];
                        chrome.tabs.update(activeTab.id, {url: result.redirect});
                    });
                })
            })
        }
    }
)