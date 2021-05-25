const gamestopSteps = {
    addToCard: 'atc',
    createPaymentId: 'createkeyId',
    createECToken: 'createEcToken',
    submitShipping: 'submitShipping',
    setShippingMethod: 'setShippingMethod',
    getKeyId: 'getKeyId',
    submitCardDetails: 'submitCardDetails'
}

const gamestopAPI = {
    submitShipping: async (options, tabId) => {
        sendNotif(tabId, 'Submitting Shipping...')
        const response = await fetch("https://www.gamestop.de/api/checkout/CreateAddress", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9,de;q=0.8",
                "content-type": "application/json",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                "sec-ch-ua-mobile": "?0",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin"
            },
            "body": "{" +
                `\"firstName\":\"${options.firstName}\",` +
                `\"surname\":\"${options.lastName}\",` +
                "\"company\":\"\"," +
                `\"address1\":\"${options.streetName} ${options.streetNumber}\",` +
                "\"address2\":\"\"," +
                `\"city\":\"${options.city}\",` +
                "\"nation\":7," +
                `\"phone\":\"${options.phoneNumber}\",` +
                `\"zip\":\"${options.postcode}\",` +
                "\"poBox\":null}",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
        return response
    },
    setShippingMethod: async (tabId) => {
        sendNotif(tabId, 'Setting Shiping Method...')
        const response = await fetch(`https://www.gamestop.de/api/checkout/SetShippingMethod?shippingMethodId=17`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9,de;q=0.8",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                "sec-ch-ua-mobile": "?0",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin"
            },
            "body": null,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
        return response
    }
}


const fullRequestCheckoutGamestop = (options, pid, keyIdObject, tabId,step) => {
    chrome.tabs.get(tabId, async () => {
        if (chrome.runtime.lastError) {
            console.log('Closed Tab')
        }
        else {
            switch (step){
                case gamestopSteps.addToCard: {
                    try {
                        sendNotif(tabId, 'Adding To Card...')
                        const response = await fetch(`https://www.gamestop.de/api/cart/AddProduct?pvid=${pid}`, {
                            "headers": {
                                "accept": "*/*",
                                "accept-language": "en-US,en;q=0.9,de;q=0.8",
                                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                                "sec-ch-ua-mobile": "?0",
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-origin",
                                "x-requested-with": "XMLHttpRequest"
                            },
                            "body": null,
                            "method": "POST",
                            "mode": "cors",
                            "credentials": "include"
                        });
                        if(response.status === 200){
                            sendNotif(tabId, 'Successfully Added To Card')
                            fullRequestCheckoutGamestop(options, pid, keyIdObject, tabId, gamestopSteps.submitShipping)
                        }
                        else {
                            throw 'Error adding to Cart Retrying...'
                        }
                    } catch (error){
                        sendNotif(tabId, error)
                        await timeout(1000)
                        fullRequestCheckoutGamestop(options, pid, keyIdObject, tabId, gamestopSteps.addToCard)
                    }
                    break
                }
                case gamestopSteps.submitShipping: {
                    try {
                        const response = await gamestopAPI.submitShipping(options, tabId)
                        if (response.status === 200){
                            fullRequestCheckoutGamestop(options, pid, keyIdObject, tabId, gamestopSteps.setShippingMethod)
                        }
                        else throw 'Error submitting shipping Retrying...'
                    } catch (error){
                        sendNotif(tabId, error)
                        await timeout(1000)
                        fullRequestCheckoutGamestop(options, pid, keyIdObject, tabId, step)
                    }
                    break
                }
                case gamestopSteps.setShippingMethod: {
                    try {
                        const response = await gamestopAPI.setShippingMethod(tabId)
                        if (response.status === 200){
                            fullRequestCheckoutGamestop(options, pid, keyIdObject, tabId, gamestopSteps.getKeyId)
                        }
                        else throw 'Error setting shipping method retrying...'
                    } catch (error){
                        sendNotif(tabId, error)
                        await fullRequestCheckoutGamestop(options, pid, keyIdObject, tabId, gamestopSteps.setShippingMethod)
                    }
                    break
                }
                case gamestopSteps.getKeyId: {
                    //++++++++++++++++++++++++++++++++++++++++++++++++TEMPORARY++++++++++++++++++++++++++++++++++++++++//
                    sendNotif(tabId, 'Redirecting to checkout Page...')
                    chrome.tabs.update(tabId, {url: 'https://www.gamestop.de/App/Index/Checkout/3'})
                    //+++++++++++++++++++++++++++++++++++++++++++++++TEMPORARY+++++++++++++++++++++++++++++++++++++++++//
                    if(false){
                        try {
                            sendNotif(tabId, 'Getting Key Id...')
                            const response = await fetch("https://www.gamestop.de/api/payment/GetCyberSourceKey", {
                                "headers": {
                                    "accept": "application/json, text/plain, */*",
                                    "accept-language": "en-US,en;q=0.9,de;q=0.8",
                                    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                                    "sec-ch-ua-mobile": "?0",
                                    "sec-fetch-dest": "empty",
                                    "sec-fetch-mode": "cors",
                                    "sec-fetch-site": "same-origin"
                                },
                                "body": null,
                                "method": "GET",
                                "mode": "cors",
                                "credentials": "include"
                            });
                            if(response.status === 200){
                                const keyIdObject = await response.json()

                                //fullRequestCheckoutGamestop(options, pid, keyIdObject, tabId, gamestopSteps.submitCardDetails)
                            } else throw 'Failed getting Key Id'
                        } catch(error){
                            sendNotif(tabId, error)
                            await timeout(1000)
                            fullRequestCheckoutGamestop(options, pid, keyIdObject, tabId, gamestopSteps.getKeyId)
                        }
                    }
                    break
                }
                case gamestopSteps.submitCardDetails: {
                    try {
                        const publicKey = await
                            window.crypto.subtle.importKey(
                                "jwk",
                                keyIdObject.jwk,
                        {
                                name: "RSA-OAEP",
                                hash: {name: "SHA-256"}
                                 },
                        false, // key is not extractable
                            ["encrypt"] // key usage
                    )
                        sendNotif(tabId, 'Submitting Card Details...')
                        const ccBuf = new ArrayBuffer(options.cardNumber.length*2)
                        const encryptedCC = await crypto.subtle.encrypt(
                            {
                            name: "RSA-OAEP"
                        }, publicKey, ccBuf);
                        const encryptedCCString = String.fromCharCode.apply(null, new Uint8Array(encryptedCC));
                        console.log(encryptedCCString)
                        const response = await fetch("https://flex.cybersource.com/cybersource/flex/v1/tokens", {
                            "headers": {
                                "accept": "*/*",
                                "accept-language": "en-US,en;q=0.9,de;q=0.8",
                                "content-type": "application/json; charset=UTF-8",
                                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                                "sec-ch-ua-mobile": "?0",
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-origin"
                            },
                            "referrer": `https://flex.cybersource.com/cybersource/assets/microform/0.4.0/iframe.html?keyId=${keyIdObject.keyId}`,
                            "referrerPolicy": "strict-origin-when-cross-origin",
                            "body": "{" +
                                `\"keyId\":\"${keyIdObject.keyId}\",` +
                                "\"cardInfo\":{" +
                                `\"cardNumber\":\"${encryptedCCString}\",` +
                                "\"cardType\":\"002\"," +
                                `\"cardExpirationMonth\":\"${options.expireMonth}\",` +
                                `\"cardExpirationYear\":\"${options.expireYear}\"` +
                                "}}",
                            "method": "POST",
                            "mode": "cors",
                            "credentials": "include"
                        });
                        if (response.status=== 200){
                            const result = await response.json()
                            sendNotif(tabId, 'Success')
                            console.log(result)
                        }
                        else throw 'Failed Submitting CardDetails Retrying...'
                    } catch (error){
                        sendNotif(tabId, error)
                        console.log(error)
                        await timeout(1000)
                        //fullRequestCheckoutGamestop(options, pid, keyIdObject, tabId, gamestopSteps.submitCardDetails)
                    }
                }
            }
        }
    })

}

const gamestopCheckoutFromCart = async (options,tabId, step) => {
    switch(step) {
        case gamestopSteps.submitShipping: {
            try {
                const response = await gamestopAPI.submitShipping(options, tabId)
                if (response.status === 200){
                    gamestopCheckoutFromCart(options, tabId, gamestopSteps.setShippingMethod)
                }
                else throw 'Error Submitting Shipping Retrying...'
            } catch (error){
               sendNotif(tabId, error)
               await timeout(1000)
               gamestopCheckoutFromCart(options, tabId, gamestopSteps.submitShipping)
            }
        }
        case gamestopSteps.setShippingMethod: {
            try {
                const response = await gamestopAPI.setShippingMethod(tabId)
                if (response.status === 200){
                    sendNotif(tabId, 'Redirecting to Checkout Page...')
                    chrome.tabs.update(tabId, {url: 'https://www.gamestop.de/App/Index/Checkout/3'})
                }
                else throw 'Error setting shipping method Retrying... '
            } catch(error){
                sendNotif(tabId, error)
                await timeout(1000)
                gamestopCheckoutFromCart(options, tabId, gamestopSteps.setShippingMethod)
            }
        }
    }

}


chrome.runtime.onMessage.addListener(
    (request, sender) => {
        getOptions().then(options => {
            const isValid = validateOptions(options)
            if(request.message === 'checkoutPossibleGamestop'){
                if (isValid){
                    if (options.gamestopRequestEnabled){
                        fullRequestCheckoutGamestop(options, request.productId, null, sender.tab.id,gamestopSteps.addToCard)
                    }
                    else {
                        sendNotif(sender.tab.id, 'Module Disabled')
                    }
                }
                else {
                    sendNotif(sender.tab.id, 'Invalid Profile')
                }
            }
            else if (request.message === 'checkoutFromCartSitePossible'){
                if(isValid){
                    if (options.gamestopCheckoutFromCartEnabled){
                        gamestopCheckoutFromCart(options, sender.tab.id, gamestopSteps.submitShipping)
                    }
                    else {
                        sendNotif(sender.tab.id, 'Module Disabled')
                    }
                }
                else {
                    sendNotif(sender.tab.id, 'Invalid Profile')
                }
            }
            else if (request.message === 'sendNotifWithCreditCardDetails'){
                sendNotif(sender.tab.id, `Name: ${options.firstName} ${options.lastName}<br/> CC: ${options.cardNumber} <br/> M: ${options.expireMonth} Y: ${options.expireYear} CCV: ${options.cvv}`)
            }
            }
        )
    }
)