const startCheckoutNbb = (tabId, klarnaTokenId, klarnaSessionId, options) => {
    chrome.tabs.get(tabId, async () => {
        if (chrome.runtime.lastError){
            console.log('Closed Tab')
        }
        else {
            sendNotif(tabId,'Starting Checkout...')
            try {
                const response = await fetch("https://www.notebooksbilliger.de/kasse", {
                    "headers": {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "accept-language": "en-US,en;q=0.9,de;q=0.8",
                        "cache-control": "max-age=0",
                        "content-type": "application/x-www-form-urlencoded",
                        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1"
                    },
                    "referrer": "https://www.notebooksbilliger.de/kasse",
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": "action=process&" +
                        "customer_type=privat&" +
                        "newbilling%5Bgender%5D=m&" +
                        "newbilling%5Bgender%5D=m&" +
                        `newbilling%5Bfirstname%5D=${options.firstName}&` +
                        `newbilling%5Blastname%5D=${options.lastName}&` +
                        `newbilling%5Bstreet_address%5D=${options.streetName}&` +
                        `newbilling%5Bstreet_address_number%5D=${options.streetNumber}&` +
                        `newbilling%5Bpostcode%5D=${options.postcode}&` +
                        `newbilling%5Bcity%5D=${options.city}&` +
                        "newbilling%5Bcountry_id%5D=81&" +
                        "newbilling%5Bcountry_id%5D=81&" +
                        `newbilling%5Bemail_address%5D=${options.email}&` +
                        `newbilling%5Btelephone%5D=%2B${options.phoneNumber}&` +
                        "newbusbilling%5Bbusiness_form%5D=0&" +
                        "newbusbilling%5Bbusiness_special_form%5D=0&" +
                        "newbusbilling%5Bcompany%5D=&" +
                        "newbusbilling%5Bgender%5D=m&" +
                        "newbusbilling%5Bfirstname%5D=&" +
                        "newbusbilling%5Blastname%5D=&" +
                        "newbusbilling%5Bstreet_address%5D=&" +
                        "newbusbilling%5Bstreet_address_number%5D=&" +
                        "newbusbilling%5Bpostcode%5D=&" +
                        "newbusbilling%5Bcity%5D=&" +
                        "newbusbilling%5Bcountry_id%5D=81&" +
                        "newbusbilling%5Bustid%5D=&" +
                        "newbusbilling%5Bemail_address%5D=&" +
                        "newbusbilling%5Btelephone%5D=&" +
                        "delivery%5Bbook_id%5D=&delivery%5Bpacknumber%5D=&" +
                        "delivery%5Bdelivery_method%5D=&" +
                        "delivery%5Bcompany%5D=&" +
                        "delivery%5Bpostnumber%5D=&" +
                        "delivery%5Bgender%5D=m&" +
                        "delivery%5Bgender%5D=m&" +
                        "delivery%5Bfirstname%5D=&" +
                        "delivery%5Blastname%5D=&" +
                        "delivery%5Bstreet_address%5D=&" +
                        "delivery%5Bstreet_address_number%5D=&" +
                        `delivery%5Bpostcode%5D=&` +
                        `delivery%5Bcity%5D=&` +
                        "delivery%5Bcountry_id%5D=81&" +
                        "delivery%5Bcountry_id%5D=81&" +
                        "busdelivery%5Bbook_id%5D=&" +
                        "busdelivery%5Bpacknumber%5D=&" +
                        "delivery%5Bdelivery_method%5D=&" +
                        "busdelivery%5Bcompany%5D=&" +
                        "busdelivery%5Bpostnumber%5D=&" +
                        "busdelivery%5Bgender%5D=m&" +
                        "busdelivery%5Bfirstname%5D=&" +
                        "busdelivery%5Blastname%5D=&" +
                        "busdelivery%5Bstreet_address%5D=&" +
                        "busdelivery%5Bstreet_address_number%5D=&" +
                        "busdelivery%5Bpostcode%5D=&" +
                        "busdelivery%5Bcity%5D=&" +
                        "busdelivery%5Bcountry_id%5D=&" +
                        "busdelivery%5Bcountry_id%5D=busdelivery%5Bcountry_id%5D&" +
                        "coupon=&" +
                        "payment=creditcard&" +
                        `klarna_client_token=${klarnaTokenId}&` +
                        `klarna_session_id=${klarnaSessionId}&` +
                        "shipping%5B55%5D=hermes&" +
                        "conditions=1",
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include",
                    "redirect": "manual"
                });
                if (response.status === 0){
                    sendNotif(tabId,'Success! Redirecting...')
                    chrome.tabs.update(tabId, {url: "https://www.notebooksbilliger.de/kasse/zusammenfassung"})
                }
                else {
                    throw 'Error checking out'
                }
            } catch (error) {
                sendNotif(tabId,'Error Starting Checkout')
                console.log(error)
                await timeout(1000)
                startCheckoutNbb(tabId, klarnaTokenId, klarnaSessionId, options)
            }
        }
    })
}

const encryptCheckoutNbb = (pToken, options, tabId) => {
    chrome.tabs.get(tabId, async () => {
        if (chrome.runtime.lastError){
            console.log('Closed Tab')
        }
        else {
            sendNotif(tabId,'Encrypting Checkout...')
            try {
                const response = await fetch("https://secure.pay1.de/client-api/?" +
                    "aid=39491&" +
                    "encoding=ISO-8859-1&mid=25251&" +
                    "mode=live&" +
                    "portalid=2017951&" +
                    "responsetype=JSON&" +
                    "request=creditcardcheck&" +
                    "storecarddata=yes&" +
                    "hash=a18edeac0ed3224ba59efc38c6e48a0cfc21783148b465821c84302e9e36bad6fe75ccd07d017523470318125113fc5a&" +
                    `cardpan=${options.cardNumber}&` +
                    `cardexpiremonth=${options.expireMonth}&` +
                    `cardexpireyear=${options.expireYear}&` +
                    "cardtype=M&" +
                    "channelDetail=payoneHosted&" +
                    `cardcvc2=${options.cvv}&` +
                    "callback_method=PayoneGlobals.callback", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "en-US,en;q=0.9,de;q=0.8",
                        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-dest": "script",
                        "sec-fetch-mode": "no-cors",
                        "sec-fetch-site": "same-origin"
                    },
                    "referrer": "https://secure.pay1.de/client-api/js/v1/payone_iframe.html?1620165934169",
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": null,
                    "method": "GET",
                    "mode": "cors",
                    "credentials": "omit"
                });
                const result = await response.text()
                const regexExpr = new RegExp("{([^}]*)}")
                const resultString = regexExpr.exec(result)
                const resultObject = JSON.parse(resultString[0])
                if (resultObject.status === 'VALID'){
                    sendNotif(tabId,'Success! Completing Checkout...')
                    chrome.tabs.sendMessage(tabId, {message: 'completeCheckoutNbb', pToken: pToken, tabId: tabId, pseudoCardPan: resultObject.pseudocardpan})
                }
                else if(resultObject.status === 'INVALID') {
                    sendNotif(tabId,'Invalid Card Details')
                }
                else throw 'Unkown error'
            } catch (error) {
                sendNotif(tabId,'Error Encrypting Checkout. Retrying...')
                console.log(error)
                await timeout(2000)
                encryptCheckoutNbb(pToken, options, tabId)
            }
        }
    })
}

const completeCheckoutNbb = (pToken, pseudoCardPan, options, tabId) => {
    chrome.tabs.get(tabId, async () => {
        if (chrome.runtime.lastError){
            console.log('Closed Tab')
        }
        else {
            sendNotif(tabId,'Completing Checkout...')
            try {
                const response = await fetch("https://www.notebooksbilliger.de/checkout_process.php", {
                    "headers": {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "accept-language": "en-US,en;q=0.9,de;q=0.8",
                        "cache-control": "max-age=0",
                        "content-type": "application/x-www-form-urlencoded",
                        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1"
                    },
                    "referrer": "https://www.notebooksbilliger.de/kasse/zusammenfassung",
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": "status=VALID&" +
                        `pseudocardpan=${pseudoCardPan}&` +
                        `truncatedcardpan=${options.cardNumber.substr(0, 5)}XXXXXX${options.cardNumber.substr(12, 15)}&` +
                        "cardtype=M&" +
                        `cardexpiredate=${options.expireYear}${options.expireMonth}&` +
                        `_ptoken=${pToken}`,
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                });
                if (response.status === 200){
                    sendNotif(tabId,'Success! Redirecting to 3DS...')
                    console.log(response.location)
                    chrome.tabs.update(tabId, {url: response.url})
                }
                else {
                    throw 'Error Completing Checkout'
                }
            } catch (error) {
                sendNotif(tabId,'Error Completing Checkout. Retrying...')
                console.log(error)
                await timeout(2000)
                completeCheckoutNbb(pToken, options, tabId)
            }
        }
    })
}


const addToCardNbb = (url, pid, category, tabId) => {
    chrome.tabs.get(tabId, async () => {
        if (chrome.runtime.lastError){
            console.log('Closed Tab')
        }
        else {
            sendNotif(tabId,'Adding To Card...')
            try {
                const response = await fetch(`${url}/action/add_product`, {
                    "redirect": "manual",
                    "headers": {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "accept-language": "en-US,en;q=0.9,de;q=0.8",
                        "cache-control": "max-age=0",
                        "content-type": "application/x-www-form-urlencoded",
                        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1"
                    },
                    "referrer": `${url}`,
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": "warranty_choice=default&" +
                        `products_id=${pid}&` +
                        `categories_id=${category}`,
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                })
                if (response.status === 0){
                    sendNotif(tabId,'Successfully Added To Cart! Redirecting...')
                    chrome.tabs.update(tabId, {url: 'https://www.notebooksbilliger.de/kasse/unregistriert'})
                }
                else {
                    throw 'Error adding to card'
                }
            } catch (error) {
                sendNotif(tabId,'Error Adding To Card Retrying...')
                await timeout(1000)
                addToCardNbb(url, pid, category, tabId)
            }
        }
    })
}


chrome.runtime.onMessage.addListener(
    (request, sender) => {
        getOptions().then(options => {
        const isValid = validateOptions(options)
        if(options.nbbEnabled && isValid){
            if (request.message === 'addToCardNbb'){
                addToCardNbb(request.url, request.productId, request.categoryId, sender.tab.id)
            }
            else if (request.message === 'startCheckoutNbb'){
                startCheckoutNbb(sender.tab.id, request.klarnaTokenId, request.klarnaSessionId, options)
            }
            else if (request.message === 'encryptCheckoutNbb'){
                encryptCheckoutNbb(request.pToken, options, sender.tab.id)
            }
            else if (request.message === 'completeCheckoutNbb'){
                completeCheckoutNbb(request.pToken, request.pseudoCardPan, options, sender.tab.id)
            }
        }
        else if (!options.nbbEnabled){
            chrome.tabs.sendMessage(sender.tab.id, {message: 'notif', text: 'Module Disabled' } )
        }
        else if (!isValid){
            chrome.tabs.sendMessage(sender.tab.id, {message: 'notif', text: 'Invalid Profile' } )
        }
        })
    }
)